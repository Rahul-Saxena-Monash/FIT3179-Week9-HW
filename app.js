async function loadGeoData() {
    const response = await fetch('/GeoJSON/ocean_acidification_geo.json');
    return await response.json();
}

async function loadOceanData() {
    const response = await fetch('/GeoJSON/ne_110m_ocean.json');
    return await response.json();
}

async function loadGraticuleData() {
    const response = await fetch('/GeoJSON/ne_110m_graticules_30.json');
    return await response.json();
}

function getChartDimensions() {
    return {
        width: Math.max(300, window.innerWidth * 0.8),
        height: Math.max(200, window.innerHeight * 0.84)
    };
}

async function createCharts() {
    const geoData = await loadGeoData();
    const oceanData = await loadOceanData();
    const graticuleData = await loadGraticuleData();
    const { width, height } = getChartDimensions();

    const phChart = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: width,
        height: height,
        title: 'pH values deviation from global average of Ocean Water near Australia in 2013',
        projection: {
            type: 'conicEqualArea',
            center: [0, -25],  // Centered on Australia
            rotate: [-133, 0, 0],
            parallels: [-18, -36],
            scale: 850,
        },
        layer: [
            {
                data: {
                    values: oceanData.features
                },
                mark: {
                    type: "geoshape",
                    fill: "lightgray"
                }
            },
            {
                data: {
                    values: graticuleData.features
                },
                mark: {
                    type: "geoshape",
                    stroke: "gray",
                    filled: false,
                    strokeWidth: 1.5
                }
            },
            {
                data: {
                    values: geoData.features
                },
                mark: {
                    type: "circle"
                },
                encoding: {
                    latitude: {
                        field: "geometry.coordinates.1",
                        type: "quantitative"
                    },
                    longitude: {
                        field: "geometry.coordinates.0",
                        type: "quantitative"
                    },
                    color: {
                        field: "properties.pH_deviation",
                        type: "quantitative",
                        title: "pH Deviation from Global Avg",
                        scale: {
                            domain: [-0.1, -0.05, 0, 0.05, 0.1],
                            range: ['#d73027', '#fc8d59', '#e0e0e0', '#91bfdb', '#4575b4']
                        }
                    },
                    size: {
                        value: 50
                    },
                    tooltip: [
                        { field: "geometry.coordinates.1", type: "quantitative", title: "Latitude" },
                        { field: "geometry.coordinates.0", type: "quantitative", title: "Longitude" },
                        { field: "properties.pH_deviation", type: "quantitative", title: "pH deviation" }
                    ]
                }
            }
        ]
    };

    vegaEmbed('#ph-map', phChart);
}

createCharts();
window.addEventListener('resize', createCharts);