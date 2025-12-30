import osmtogeojson from 'osmtogeojson';

// Main Overpass API (Reliable)
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export const fetchOverpassData = async (query) => {
    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        });

        if (!response.ok) {
            throw new Error(`Overpass API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return osmtogeojson(data);
    } catch (error) {
        console.error('Failed to fetch/convert Overpass data:', error);
        throw error;
    }
};

export const getOverpassQuery = (key, filter) => {
    const template = QUERY_TEMPLATES[key];
    if (!template) return '';
    return template.replace(/{{bbox}}/g, filter);
};

const QUERY_TEMPLATES = {
    highways: `
        [out:json];
        (
          way["highway"~"motorway|trunk|primary|secondary"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    local_roads: `
        [out:json];
        (
          way["highway"~"residential|service|tertiary"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    green: `
         [out:json];
        (
          way["leisure"="park"]{{bbox}};
          relation["leisure"="park"]{{bbox}};
          way["landuse"="grass"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    industrial: `
        [out:json];
        (
          way["landuse"="industrial"]{{bbox}};
          relation["landuse"="industrial"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    residential: `
        [out:json];
        (
            way["landuse"="residential"]{{bbox}};
            relation["landuse"="residential"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    public_services: `
        [out:json];
        (
            node["amenity"~"school|hospital|university|college|public_building"]{{bbox}};
            way["amenity"~"school|hospital|university|college|public_building"]{{bbox}};
        );
        out center;
    `,
    water: `
        [out:json];
        (
            way["natural"="water"]{{bbox}};
            relation["natural"="water"]{{bbox}};
            way["waterway"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    railway: `
        [out:json];
        (
            way["railway"="rail"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    buildings: `
        [out:json];
        (
            way["building"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    commercial: `
        [out:json];
        (
            way["landuse"="commercial"]{{bbox}};
            relation["landuse"="commercial"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    retail: `
        [out:json];
        (
             way["landuse"="retail"]{{bbox}};
             relation["landuse"="retail"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    parking: `
        [out:json];
        (
            way["amenity"="parking"]{{bbox}};
            relation["amenity"="parking"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    farmland: `
        [out:json];
        (
            way["landuse"="farmland"]{{bbox}};
            relation["landuse"="farmland"]{{bbox}};
             way["landuse"="farmyard"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    forests: `
        [out:json];
        (
            way["landuse"="forest"]{{bbox}};
            relation["landuse"="forest"]{{bbox}};
            way["natural"="wood"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    cemeteries: `
         [out:json];
        (
            way["landuse"="cemetery"]{{bbox}};
            relation["landuse"="cemetery"]{{bbox}};
            way["amenity"="crematorium"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    military: `
        [out:json];
        (
            way["landuse"="military"]{{bbox}};
            relation["landuse"="military"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    sports: `
        [out:json];
        (
            way["leisure"~"sports_centre|stadium|pitch"]{{bbox}};
            relation["leisure"~"sports_centre|stadium|pitch"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `,
    restaurants: `
        [out:json];
        (
            node["amenity"~"restaurant|cafe|fast_food"]{{bbox}};
        );
        out body;
    `,
    religious: `
        [out:json];
        (
            way["amenity"="place_of_worship"]{{bbox}};
            node["amenity"="place_of_worship"]{{bbox}};
        );
        out body;
        >;
        out skel qt;
    `
};

export const QUERIES = QUERY_TEMPLATES;
