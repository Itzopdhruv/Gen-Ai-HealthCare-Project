import React from 'react';
import { LAYER_CONFIGS } from '../data/layers';
import { Layers, Eye, EyeOff, Loader2, Map as MapIcon, XCircle } from 'lucide-react';

const MapSidebar = ({
    visibleLayers, loadingLayers, featureCounts, toggleLayer, activeBasemap, setBasemap,
    overlayOpacity = 0.5, setOverlayOpacity,
    selectedWard, selectWard, clearSelection
}) => {
    // REMOVED Ward Search/Selection Logic as per user request

    return (
        <div className="w-80 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-white/50 flex flex-col max-h-[85vh] transition-all hover:shadow-blue-900/10">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-slate-800 tracking-tight">Map Layers</h2>
                    </div>
                </div>

                {/* SHOW SELECTED WARD IF ANY (BUT NO SEARCH) */}
                {selectedWard && (
                     <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2">
                                <MapIcon size={14} className="text-blue-600" />
                                <span className="text-xs font-bold text-blue-700 truncate max-w-[150px]">{selectedWard.name}</span>
                            </div>
                            {/* Option to clear selection removed if we rely on "Decision Support" auto-select? 
                                But user might want to clear. User said "remove the feature to search wards". 
                                I'll keep clear button just in case. */}
                            {/* <button
                                onClick={() => clearSelection()}
                                className="text-red-500 hover:text-red-600 transition-colors"
                            >
                                <XCircle size={14} />
                            </button> */}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                {/* Basemaps Section */}
                <div>
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 pl-1">Basemap</h3>
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setBasemap('osm')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${activeBasemap === 'osm' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                        >
                            Standard
                        </button>
                        <button
                            onClick={() => setBasemap('carto')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${activeBasemap === 'carto' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                        >
                            Light
                        </button>
                        <button
                            onClick={() => setBasemap('satellite')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${activeBasemap === 'satellite' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                        >
                            Satellite
                        </button>
                    </div>

                    {/* Opacity Control for Satellite */}
                    {activeBasemap === 'satellite' && (
                        <div className="mt-3 px-1 animate-in fade-in slide-in-from-top-2">
                             <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                                <span>Layer Opacity</span>
                                <span className="text-blue-600">{(overlayOpacity * 100).toFixed(0)}%</span>
                             </div>
                             <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={overlayOpacity}
                                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 my-2"></div>

                {/* Layers List */}
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Categories</h3>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{LAYER_CONFIGS.length} Types</span>
                    </div>

                    <div className="space-y-1">
                        {LAYER_CONFIGS.map(layer => (
                            <div
                                key={layer.id}
                                className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => toggleLayer(layer.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Color Indicator */}
                                    <div
                                        className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${visibleLayers[layer.id] ? 'scale-110 shadow-sm' : 'opacity-40 grayscale'}`}
                                        style={{ backgroundColor: layer.color }}
                                    >
                                        {visibleLayers[layer.id] && <div className="w-1 h-1 bg-white/50 rounded-full"></div>}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold transition-colors ${visibleLayers[layer.id] ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {layer.label}
                                        </span>
                                        
                                        {/* Status Message */}
                                        <div className="text-[10px] font-medium h-3">
                                             {loadingLayers[layer.id] ? (
                                                <span className="text-blue-500 italic animate-pulse">Updating...</span>
                                            ) : featureCounts[layer.id] !== undefined ? (
                                                <span className={`${featureCounts[layer.id] === -1 ? 'text-red-500 font-bold' :
                                                    featureCounts[layer.id] === 0 ? 'text-slate-300' : 'text-slate-500'
                                                    }`}>
                                                    {featureCounts[layer.id] === -1 ? 'Fetch Failed (Click to Retry)' :
                                                     featureCounts[layer.id] === 0 ? 'No results' :
                                                     `${featureCounts[layer.id]} items`}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLayer(layer.id); }}
                                    className={`p-1.5 rounded-md transition-all ${visibleLayers[layer.id] ? 'bg-blue-50 text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}
                                >
                                    {visibleLayers[layer.id] ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] text-center text-slate-400 font-medium">
                    Data © OpenStreetMap contributors<br/>
                    {selectedWard ? <span className="text-blue-500 font-bold">Focused Area Active</span> : "Move map to explore"}
                </div>
            </div>
        </div>
    );
};

export default MapSidebar;
