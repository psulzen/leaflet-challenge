// Store our API endpoint inside queryUrl
// Last 7 days of Earthquakes, or "all week" as you can see in URL
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"  

//  var queryUrl =  "https://data.openstates.org/boundaries/2018/ocd-division/country:us/state:ks/sldl:1.json"
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

//   // Define a function we want to run once for each feature in the features array
//   // Give each feature a popup describing the place and time of the earthquake

function createFeatures(earthquakeData) {
  var circleArray = new Array();
  // Loop through the cities array and create one marker for each earthquake object
  // Colors will match the legend (below)
  
  for (var i = 0; i < earthquakeData.length; i++) {
    coordinates = [earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]]
    properties = earthquakeData[i].properties;
    var color = "";
    if (properties.mag < 1) {
      color = "lightpink";
    }
    else if (properties.mag < 2) {
      color = "lightblue";
    }
    else if (properties.mag < 3) {
      color = "lightgreen";
    }
    else if (properties.mag < 4) {
      color = "yellow";
    }
    else if (properties.mag < 5) {
      color = "orange";
    }
    else if (properties.mag >= 5) {
      color = "red";
    }


    // Add circles to map
    var myCircle = L.circle(coordinates, {
      fillOpacity: 0.75,
      color: color,
      fillColor: color,
      radius: (properties.mag * 15000)
    }).bindPopup("<h3>" + properties.place + "</h3> <hr> <h3>Magnitude: " + properties.mag.toFixed(1) + "</h3>" + "<hr> <h4>Occurence: " +  new Date(properties.time) + "</h4>" + "</h3> <hr> Coordinates:" + coordinates + "</h3>") ;
   
    //Add the cricle to the array
    circleArray.push(myCircle);
  }
  
  //Create the layer for the circles
  var earthquakes = L.layerGroup(circleArray);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// funtion for creating the map layers.  We will send the earthquake data to it.
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: config.API_KEY
  });

//
 var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: config.API_KEY
  

  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var info = L.control({
      position: "bottomright"
  });

  info.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    return div;
  }

  info.addTo(myMap);

  document.querySelector(".legend").innerHTML=displayLegend();


} // end of the Createmap function


var legend = L.control({position: 'bottomleft'});
legend.onAdd = function (map) {

var div = L.DomUtil.create('div', 'info legend');
labels = ['<strong>Categories</strong>'],
categories = ['Company','Church','Shop','Other'];

for (var i = 0; i < categories.length; i++) {

      div.innerHTML += 
      labels.push(
          '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
      (categories[i] ? categories[i] : '+'));

  }
  div.innerHTML = labels.join('<br>');
return div;
};

// Colors for our legend, matching the colors we chose for the earthquakes
function displayLegend(){
  var legendInfo = [{
      limit: "Mag: 0-1",
      color: "lightpink"
  },{
      limit: "Mag: 1-2",
      color: "lightblue"
  },{
      limit:"Mag: 2-3",
      color:"lightgreen"
  },{
      limit:"Mag: 3-4",
      color:"yellow"
  },{
      limit:"Mag: 4-5",
      color:"orange"
  },{
      limit:"Mag: 5+",
      color:"red"
  }];

  var header = "<h3>Magnitude</h3><hr>";

  var strng = "";
 
  for (i = 0; i < legendInfo.length; i++){
      strng += "<p style = \"background-color: "+legendInfo[i].color+"\">"+legendInfo[i].limit+"</p> ";
  }
  
  return header+strng;

}