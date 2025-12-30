
// Vibrant Colors matching the requested segmented look
export const LAYER_CONFIGS = [
    { id: 'highways', label: 'Highways', queryKey: 'highways', color: '#FF8C00', type: 'line', minZoom: 12 }, // Dark Orange
    { id: 'local_roads', label: 'Local Roads', queryKey: 'local_roads', color: '#94A3B8', type: 'line', minZoom: 15 }, // Slate Grey
    { id: 'railway', label: 'Railway Lines', queryKey: 'railway', color: '#1E293B', type: 'line', minZoom: 13 }, // Dark Blue/Black

    { id: 'water', label: 'Water Bodies', queryKey: 'water', color: '#0EA5E9', type: 'polygon', minZoom: 13 }, // Sky Blue
    { id: 'green', label: 'Parks & Grass', queryKey: 'green', color: '#22C55E', type: 'polygon', minZoom: 14 }, // Vibrant Green
    { id: 'forests', label: 'Forests', queryKey: 'forests', color: '#15803D', type: 'polygon', minZoom: 12 }, // Dark Green
    { id: 'farmland', label: 'Farmland', queryKey: 'farmland', color: '#EAB308', type: 'polygon', minZoom: 12 }, // Yellow

    { id: 'industrial', label: 'Industrial Zones', queryKey: 'industrial', color: '#A855F7', type: 'polygon', minZoom: 13 }, // Purple
    { id: 'residential', label: 'Residential Areas', queryKey: 'residential', color: '#F472B6', type: 'polygon', minZoom: 13 }, // Pink
    { id: 'commercial', label: 'Commercial Areas', queryKey: 'commercial', color: '#F87171', type: 'polygon', minZoom: 14 }, // Red
    { id: 'retail', label: 'Retail Areas', queryKey: 'retail', color: '#FB923C', type: 'polygon', minZoom: 14 }, // Orange-Red
    { id: 'military', label: 'Military Areas', queryKey: 'military', color: '#EF4444', type: 'polygon', minZoom: 13 }, // Bright Red

    { id: 'buildings', label: 'Buildings', queryKey: 'buildings', color: '#64748B', type: 'polygon', minZoom: 16 }, // Slate
    { id: 'parking', label: 'Parking', queryKey: 'parking', color: '#CBD5E1', type: 'polygon', minZoom: 16 }, // Light Slate
    { id: 'cemeteries', label: 'Cemeteries', queryKey: 'cemeteries', color: '#10B981', type: 'polygon', minZoom: 15 }, // Emerald
    { id: 'sports', label: 'Sports Facilities', queryKey: 'sports', color: '#14B8A6', type: 'polygon', minZoom: 15 }, // Teal

    { id: 'public_services', label: 'Public Services', queryKey: 'public_services', color: '#3B82F6', type: 'point', minZoom: 14 }, // Blue
    { id: 'restaurants', label: 'Food & Drink', queryKey: 'restaurants', color: '#D97706', type: 'point', minZoom: 16 }, // Amber
    { id: 'religious', label: 'Religious Sites', queryKey: 'religious', color: '#7C3AED', type: 'point', minZoom: 15 }, // Violet
];
