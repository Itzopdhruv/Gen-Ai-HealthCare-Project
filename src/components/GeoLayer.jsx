import React from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';

const GeoLayer = ({ config, data, isVisible, isHighlighted, opacity }) => {

    // If no data or not visible, do not render
    if (!isVisible || !data) return null;

    const getStyle = (feature) => {
        // Feature-specific styling overrides
        const props = feature?.properties || {};

        let weight = isHighlighted ? 2 : 1;

        // Use configured color
        let color = config.color;

        let dashArray = undefined;
        let fillOpacity = opacity;

        // Specific Layer Tweaks
        if (config.id === 'railway') {
            dashArray = '5, 10';
            weight = 3;
        }

        if (config.id === 'highways') {
            const hwy = props.highway;
            if (hwy === 'motorway' || hwy === 'trunk') weight = 4;
            else if (hwy === 'primary') weight = 3;
        }

        return {
            color: color, // Stroke color
            weight: weight,
            opacity: opacity + 0.2 > 1 ? 1 : opacity + 0.2,
            fillColor: color, // Fill color same as stroke
            fillOpacity: fillOpacity,
            dashArray: dashArray
        };
    };

    const pointToLayer = (feature, latlng) => {
        return L.circleMarker(latlng, {
            radius: isHighlighted ? 8 : 5,
            fillColor: config.color,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: opacity
        });
    };

    const filterFeature = (feature) => {
        if (!feature.geometry) return false;
        const type = feature.geometry.type;

        // Strict Type Matching based on Layer Config
        if (config.type === 'line') {
            return type === 'LineString' || type === 'MultiLineString';
        }
        if (config.type === 'polygon') {
            return type === 'Polygon' || type === 'MultiPolygon';
        }
        if (config.type === 'point') {
            return type === 'Point' || type === 'MultiPoint';
        }
        return true;
    };

    const onEachFeature = (feature, layer) => {
        const props = feature.properties || {};
        // Try to find a meaningful name
        const name = props.name || props.brand || props.amenity || props.highway || 'Feature';

        layer.bindPopup(`
            <div class="min-w-[120px]">
                <div class="font-bold text-sm text-slate-800 border-b pb-1 mb-1">${name}</div>
                <div class="grid grid-cols-2 gap-1 text-xs">
                     <span class="text-slate-500">Type:</span>
                     <span class="font-medium capitalize text-slate-700">${config.label}</span>
                     ${props.amenity ? `<span class="text-slate-500">Subtype:</span><span class="font-medium capitalize text-slate-700">${props.amenity}</span>` : ''}
                </div>
            </div>
        `);
    };

    return (
        <GeoJSON
            key={`${config.id}-${isHighlighted}-${opacity}-${data?.features?.length || 0}`}
            data={data}
            style={getStyle}
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
            filter={filterFeature}
        />
    );
};

export default GeoLayer;
