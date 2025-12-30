import { useState, useEffect, useRef } from 'react';
import { LAYER_CONFIGS } from '../data/layers';
import { fetchOverpassData, getOverpassQuery } from '../api/overpass';
import { bbox, booleanPointInPolygon, intersect, booleanIntersects, booleanContains, polygonToLine, lineSplit } from '@turf/turf';

export function useMapLayers() {
    const [visibleLayers, setVisibleLayers] = useState(() => {
        const initial = {};
        LAYER_CONFIGS.forEach(l => initial[l.id] = true);
        return initial;
    });

    const [selectedWard, setSelectedWard] = useState(null);
    const [layerData, setLayerData] = useState({});
    const [featureCounts, setFeatureCounts] = useState({});
    const [loadingLayers, setLoadingLayers] = useState({});
    const [highlightedLayer, setHighlightedLayer] = useState(null);

    const abortControllers = useRef({});

    const toggleLayer = async (id) => {
        setVisibleLayers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchWorker = async (id, query, controller, wardPoly) => {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                if (controller.signal.aborted) throw new Error('Aborted');

                const timeoutId = setTimeout(() => controller.abort(), 60000);

                const geojson = await fetchOverpassData(query);
                clearTimeout(timeoutId);

                if (controller.signal.aborted) throw new Error('Aborted');

                return processGeoJSON(geojson, wardPoly);

            } catch (err) {
                if (err.message === 'Aborted' || err.name === 'AbortError') throw err;

                attempts++;
                console.warn(`Layer ${id} fetch attempt ${attempts} failed:`, err);

                if (attempts >= maxAttempts) throw err;

                const waitTime = Math.pow(2, attempts) * 1000;
                await new Promise(r => setTimeout(r, waitTime));
            }
        }
    };

    const processGeoJSON = (geojson, wardPoly) => {
        if (!wardPoly || !geojson.features || geojson.features.length === 0) return geojson;

        const wardFeature = { type: 'Feature', properties: {}, geometry: wardPoly };

        let wardBoundaryLine = null;
        try {
            const lines = polygonToLine(wardFeature);
            wardBoundaryLine = lines.features ? lines.features[0] : lines;
        } catch (e) { /* ignore */ }

        const clippedFeatures = [];

        for (const feature of geojson.features) {
            try {
                // eslint-disable-next-line no-unused-vars
                const f = feature;
                if (!f.geometry) continue;

                if (f.geometry.type === 'Point') {
                    if (booleanPointInPolygon(f.geometry.coordinates, wardPoly)) {
                        clippedFeatures.push(f);
                    }
                } else if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
                    try {
                        const clipped = intersect(f, wardFeature);
                        if (clipped) {
                            clipped.properties = f.properties;
                            clippedFeatures.push(clipped);
                        }
                    } catch (e) {
                        if (booleanIntersects(f, wardFeature)) clippedFeatures.push(f);
                    }
                } else if (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString') {
                    if (booleanIntersects(f, wardFeature)) {
                        if (booleanContains(wardFeature, f)) {
                            clippedFeatures.push(f);
                        } else if (wardBoundaryLine) {
                            try {
                                const split = lineSplit(f, wardBoundaryLine);
                                if (split.features.length > 0) {
                                    split.features.forEach((seg) => {
                                        const midIdx = Math.floor(seg.geometry.coordinates.length / 2);
                                        const pt = seg.geometry.coordinates[midIdx];
                                        if (booleanPointInPolygon(pt, wardPoly)) {
                                            seg.properties = f.properties;
                                            clippedFeatures.push(seg);
                                        }
                                    });
                                } else {
                                    clippedFeatures.push(f);
                                }
                            } catch (e) {
                                clippedFeatures.push(f);
                            }
                        } else {
                            clippedFeatures.push(f);
                        }
                    }
                }
            } catch (e) { /* skip */ }
        }
        geojson.features = clippedFeatures;
        return geojson;
    };

    const fetchLayerData = async (id, viewportBounds) => {
        if (abortControllers.current[id]) {
            abortControllers.current[id].abort();
            delete abortControllers.current[id];
        }

        setLoadingLayers(prev => ({ ...prev, [id]: true }));
        setFeatureCounts(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        const controller = new AbortController();
        abortControllers.current[id] = controller;

        try {
            const config = LAYER_CONFIGS.find(l => l.id === id);
            if (!config) throw new Error(`Config not found for ${id}`);

            let filter = '';
            let wardPoly = null;

            if (selectedWard) {
                wardPoly = selectedWard.geometry;
                try {
                    const [minLon, minLat, maxLon, maxLat] = bbox(selectedWard.geometry);
                    filter = `(${minLat},${minLon},${maxLat},${maxLon})`;
                } catch (e) {
                    filter = `(28.4,76.8,28.9,77.3)`;
                }
            } else {
                if (viewportBounds.includes(',')) {
                    filter = `(${viewportBounds})`;
                } else {
                    throw new Error('Invalid bounds');
                }
            }

            const query = getOverpassQuery(config.queryKey, filter);
            if (!query) throw new Error(`Query template not found for ${id}`);

            const geojson = await fetchWorker(id, query, controller, wardPoly);

            setLayerData(prev => ({ ...prev, [id]: geojson }));
            setFeatureCounts(prev => ({ ...prev, [id]: geojson?.features?.length || 0 }));

        } catch (error) {
            if (error.message !== 'Aborted' && error.name !== 'AbortError') {
                console.warn(`Error fetching layer ${id}:`, error);
                setFeatureCounts(prev => ({ ...prev, [id]: -1 }));
            }
        } finally {
            if (abortControllers.current[id] === controller) {
                setLoadingLayers(prev => ({ ...prev, [id]: false }));
                delete abortControllers.current[id];
            }
        }
    };

    const setHighlight = (id) => {
        setHighlightedLayer(id);
        if (id) {
            setVisibleLayers(prev => ({ ...prev, [id]: true }));
        }
    };

    const selectWard = (ward) => {
        Object.values(abortControllers.current).forEach(c => c.abort());
        abortControllers.current = {};

        setLayerData({});
        setFeatureCounts({});

        setSelectedWard(ward);
    };

    useEffect(() => {
        if (!selectedWard) return;

        setLayerData({});
        setFeatureCounts({});

        const fetchAllSafe = async () => {
            const activeLayers = LAYER_CONFIGS.filter(l => visibleLayers[l.id]);

            // Strictly fetch one by one to avoid 429 Errors
            for (let i = 0; i < activeLayers.length; i++) {
                const layer = activeLayers[i];

                await fetchLayerData(layer.id, "ignored");

                // Add a healthy delay between requests
                if (i < activeLayers.length - 1) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        };

        fetchAllSafe();
    }, [selectedWard]);

    useEffect(() => {
        if (!selectedWard) return;
        const missing = LAYER_CONFIGS.filter(l => visibleLayers[l.id] && !layerData[l.id] && !loadingLayers[l.id]);
        missing.forEach(l => fetchLayerData(l.id, "ignored"));
    }, [visibleLayers, selectedWard]);

    const clearSelection = () => {
        Object.values(abortControllers.current).forEach(c => c.abort());
        abortControllers.current = {};
        setSelectedWard(null);
        setLayerData({});
        setFeatureCounts({});
    };

    return {
        visibleLayers,
        layerData,
        loadingLayers,
        featureCounts,
        selectedWard,
        selectWard,
        clearSelection,
        toggleLayer,
        fetchLayerData,
        highlightedLayer,
        setHighlight
    };
}
