// tile layers for background of map 
var defaultMap= L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


//layers
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

var topo= L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// basemaps
let basemaps = {
    GrayScale: grayscale,
    Topography: topo,
    Default: defaultMap
}


// make map object
var myMap= L.map("map",{
    center: [36.7783, -119.4179], 
    zoom: 5,
    layers: [defaultMap, grayscale, topo]
});

// add default map to map 
defaultMap.addTo(myMap);



// -----------------tectonic plates-------------------------------------------------------

let tecplates= new L.layerGroup();

//call api for tectonic plates 
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    //console.log(plateData);

    L.geoJson(plateData,{
        color: "yellow",
        weight: 2
    }).addTo(tecplates);

});

// add tectonic plates to map 
tecplates.addTo(myMap);


// ------------------------earthquakes----------------------------------------------------
let earthquakes= new L.layerGroup();

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakedata){
        // console.log(earthquakedata)
        
        //chooses color of datapoint
        function dataColor(depth){
            if (depth>90)
                return "red";
            else if (depth>70)
                return "#fc4903";
            else if (depth>50)
                return "#fc8403";
            else if (depth >30)
                return "#fcad03";
            else if (depth >10)
                return "#cafc03";
            else 
                return "green";
        }

        // size of radius based on magnitude 
        function radiusSize(mag){
            if (mag==0)
                return 1;
            else   
                return mag *5;
        }

        function dataStyle(feature)        
        {
            return{
                opacity: 0.5,
                fillOpacity:0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5,
                stroke: true
            }
        }

        // add geoJson to earthquake layer group
        L.geoJson(earthquakedata,{
            // marker on map 
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },

            // set style
            style: dataStyle,

            // popups
            onEachFeature: function(feature,layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b><br>`)
            }


        }).addTo(earthquakes)
    }

   
  
);

// add earthquake layer to map 
earthquakes.addTo(myMap);

// overlay
let overlays={
    "Tectonic Plates": tecplates,
    "Earthquake Data": earthquakes
};

//layer control 
L.control
    .layers(basemaps,overlays)
    .addTo(myMap);


// legend 
let legend = L.control({
    position: "bottomright"
});

// properties for legend 
legend.onAdd = function() {
    // div for legend
    let div = L.DomUtil.create("div","info legend");

    // intervals
    let intervals=[-10,10,30,50,70,90];
    let colors=[
        "green",
        "#cafc03",
        "#fcad03",
        "#fc8403",
        "#fc4903",
        "red"
    ];

    //loop through intervals & colors 
    for (var i = 0; i < intervals.length; i++) {
        div.innerHTML += "<i style='background: "
            +colors[i]
            +"'></i>"
            + intervals[i]
            + (intervals[i +1] ? "km -" + intervals[i+1] + "km<br>" : "+"); 
    }

    return div; 
}; 

legend.addTo(myMap);