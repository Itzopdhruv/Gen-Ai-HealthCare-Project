
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, Layers, Map as MapIcon, Maximize2, Minimize2 } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import MapSidebar from '../components/MapSidebar';
import { PollutionInsights } from '../components/AI/PollutionInsights';
import { useMapLayers } from '../hooks/useMapLayers';
import Papa from 'papaparse';

const WardMapAnalytics = () => {
    const { wardSlug } = useParams();
    const [searchParams] = useSearchParams();
    const wardNameFromUrl = searchParams.get('name'); // Get exact name from query param
    
    // State to hold the resolved Ward Info
    const [targetWard, setTargetWard] = useState(null);
    const [loadingWard, setLoadingWard] = useState(true);

    // Use our Map Hook
    const {
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
    } = useMapLayers();

    const [activeBasemap, setBasemap] = useState('osm');
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);

    // 1. Resolve Ward Name & Geometry on Mount
    useEffect(() => {
        const resolveWard = async () => {
            setLoadingWard(true);
            try {
                // Fetch wards JSON to find geometry
                // Note: In a real app we might want to query Overpass for the boundary 
                // or have a pre-loaded JSON. The Sidebar also loads this JSON. 
                // We should probably move this fetch to a context or hook if used often.
                const res = await fetch('/data/delhi_wards.json');
                const data = await res.json();
                
                const normalize = (str) => str ? str.toString().toLowerCase().trim().replace(/\s+/g, ' ') : '';
                
                let found = null;
                if (wardNameFromUrl) {
                    const targetName = normalize(wardNameFromUrl);
                    found = data.features.find(f => normalize(f.properties.name) === targetName);
                }
                
                if (!found && wardSlug) {
                    const targetSlug = wardSlug.toLowerCase().replace(/-/g, '');
                    found = data.features.find(f => {
                         const name = normalize(f.properties.name).replace(/[^a-z0-9]/g, '');
                         return name.includes(targetSlug) || targetSlug.includes(name);
                    });
                }

                if (found) {
                    const info = {
                        name: found.properties.name,
                        geometry: found.geometry
                    };
                    setTargetWard(info);
                    // AUTO SELECT WARD IN MAP
                    selectWard(info);
                }
            } catch (e) {
                console.error("Failed to load ward geometry", e);
            } finally {
                setLoadingWard(false);
            }
        };

        resolveWard();
    }, [wardSlug, wardNameFromUrl]);


    // Scroll Handler
    const scrollToInsights = () => {
        const el = document.getElementById('insights-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="h-screen w-full bg-slate-50 overflow-y-auto overflow-x-hidden font-sans scroll-smooth">
            
            {/* Map Section - Full Height */}
            <div className="h-screen w-full relative">
                <MapComponent
                    visibleLayers={visibleLayers}
                    layerData={layerData}
                    highlightedLayer={highlightedLayer}
                    activeBasemap={activeBasemap}
                    overlayOpacity={overlayOpacity}
                    fetchLayerData={fetchLayerData}
                    selectedWard={selectedWard} // This will be set by our effect
                    clearSelection={() => {}} // Disable clearing in this view?
                />

                {/* Title Overlay */}
                <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 max-w-sm pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Decision Support</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-800 leading-none">
                        {targetWard ? targetWard.name : 'Loading Ward...'}
                    </h1>
                </div>

                {/* Map Layers Sidebar - Positioned Right */}
                <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
                    <MapSidebar
                        visibleLayers={visibleLayers}
                        loadingLayers={loadingLayers}
                        featureCounts={featureCounts}
                        toggleLayer={toggleLayer}
                        highlightedLayer={highlightedLayer}
                        setHighlight={setHighlight}
                        activeBasemap={activeBasemap}
                        setBasemap={setBasemap}
                        overlayOpacity={overlayOpacity}
                        setOverlayOpacity={setOverlayOpacity}
                        selectedWard={selectedWard}
                        selectWard={selectWard}
                        clearSelection={clearSelection}
                    />
                </div>

                {/* Scroll Down Indicator */}
                {selectedWard && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto z-[1000] animate-bounce">
                        <button 
                            onClick={scrollToInsights}
                            className="bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-white transition-colors border border-slate-200"
                        >
                            View Strategies <ChevronDown size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Insights Section - Below Fold */}
            <div id="insights-section" className="min-h-screen bg-slate-50 relative z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] rounded-t-3xl -mt-6">
                 {targetWard ? (
                    <PollutionInsights wardName={targetWard.name} />
                ) : (
                    <div className="p-20 text-center text-slate-400">
                        Initializing Analysis Engine...
                    </div>
                )}
            </div>

        </div>
    );
};

export default WardMapAnalytics;
