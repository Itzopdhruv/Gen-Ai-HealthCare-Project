import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, ScaleControl, GeoJSON, useMap } from 'react-leaflet';
import { LAYER_CONFIGS } from '../data/layers';
import GeoLayer from './GeoLayer';
import MapEventHandler from './MapEventHandler';

import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Delhi Coordinates
const CENTER_POSITION = [28.6139, 77.2090];
const ZOOM_LEVEL = 13;

const BASEMAP_URLS = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    carto: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

const BASEMAP_ATTRIBUTION = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    carto: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    satellite: '&copy; Esri'
};

const AutoCenter = ({ ward }) => {
    const map = useMap();
    useEffect(() => {
        if (ward && ward.geometry) {
            const geojsonLayer = L.geoJSON(ward.geometry);
            map.fitBounds(geojsonLayer.getBounds(), { padding: [50, 50], animate: true });
        }
    }, [ward, map]);
    return null;
};

const MapComponent = ({
    visibleLayers, layerData, highlightedLayer, activeBasemap, overlayOpacity = 0.5, fetchLayerData,
    selectedWard, clearSelection
}) => {
    const [featureOpacity, setFeatureOpacity] = React.useState(0.5);

    return (
        <MapContainer
            center={CENTER_POSITION}
            zoom={ZOOM_LEVEL}
            scrollWheelZoom={true}
            className="h-full w-full outline-none"
            style={{ cursor: 'grab', height: '100%', width: '100%' }}
        >
            <AutoCenter ward={selectedWard} />

            {!selectedWard && (
                <MapEventHandler
                    visibleLayers={visibleLayers}
                    fetchLayerData={fetchLayerData}
                />
            )}

            {selectedWard && (
                <GeoJSON
                    key={`ward-${selectedWard.name}`}
                    data={selectedWard.geometry}
                    style={{
                        color: '#2563eb',
                        fillColor: '#3b82f6',
                        dashArray: '5, 5',
                        weight: 3,
                        opacity: 0.8,
                        fillOpacity: 0.05
                    }}
                />
            )}

            {activeBasemap === 'satellite' ? (
                <>
                    {/* Bottom Layer: Satellite */}
                    <TileLayer
                        attribution={BASEMAP_ATTRIBUTION['satellite']}
                        url={BASEMAP_URLS['satellite']}
                    />
                    {/* Top Layer: OSM (with Opacity) */}
                    <TileLayer
                        attribution={BASEMAP_ATTRIBUTION['osm']}
                        url={BASEMAP_URLS['osm']}
                        opacity={overlayOpacity}
                    />
                </>
            ) : (
                <TileLayer
                    attribution={BASEMAP_ATTRIBUTION[activeBasemap]}
                    url={BASEMAP_URLS[activeBasemap]}
                />
            )}

            <ScaleControl position="bottomright" />

            {LAYER_CONFIGS.map(config => (
                <GeoLayer
                    key={config.id}
                    config={config}
                    data={layerData[config.id]}
                    isVisible={visibleLayers[config.id]}
                    isHighlighted={highlightedLayer === config.id}
                    opacity={featureOpacity}
                />
            ))}

            {/* Opacity Slider Control - On Map */}
            <div className="leaflet-bottom leaflet-left pointer-events-auto mb-8 ml-4 z-[999]">
                <div className="leaflet-control bg-white p-2 rounded shadow-md flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-12">Opacity</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={featureOpacity}
                        onChange={(e) => setFeatureOpacity(parseFloat(e.target.value))}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right">{featureOpacity.toFixed(2)}</span>
                </div>
            </div>
        </MapContainer>
    );
};

export default MapComponent;
