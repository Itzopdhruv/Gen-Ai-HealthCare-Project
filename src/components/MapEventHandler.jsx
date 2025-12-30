import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { LAYER_CONFIGS } from '../data/layers';

const MapEventHandler = ({ visibleLayers, fetchLayerData }) => {

    const map = useMapEvents({
        moveend: () => {
            updateData();
        },
        zoomend: () => {
            updateData();
        }
    });

    const updateData = () => {
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        // Format: south,west,north,east
        const bboxString = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

        LAYER_CONFIGS.forEach(layer => {
            // Check 1: Is layer enabled?
            if (!visibleLayers[layer.id]) return;

            // Check 2: Are we zoomed in enough?
            if (layer.minZoom && zoom < layer.minZoom) return;

            // Fetch data for current view
            fetchLayerData(layer.id, bboxString);
        });
    };

    // Initial load
    useEffect(() => {
        updateData();
    }, []); // Run once on mount (and then on events)

    return null;
};

export default MapEventHandler;
