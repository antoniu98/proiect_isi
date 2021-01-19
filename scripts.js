let transport = [];
let attractions = [];

var layer = null;
var layer2 = null;

const urlAttractions = 'http://localhost:3000/attractions';
const urlTransport = 'http://localhost:3000/transport';

let onExpresion = "price > 0";
let falseExpresion = "price < 0";
let filterExpresion = "price > ";

let attractionsFilter = "object_type = 'attraction'"
let transportFilter = "object_type = 'transport'"

var view;

require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/widgets/BasemapGallery",
        "esri/widgets/Legend",
        "esri/Graphic",
        "esri/widgets/Track",
    ],
    function(
        Map,
        MapView,
        FeatureLayer,
        BasemapGallery,
        Legend,
        Graphic,
        Track
    ) {

        var map = new Map({
            basemap: "topo-vector"
        });

        view = new MapView({
            container: "viewDiv",
            map: map,
            center: [-123.12, 49.28],
            zoom: 12
        });

        var basemapGallery = new BasemapGallery({
            view: view,
            source: {
              portal: {
                url: "http://www.arcgis.com",
                useVectorBasemaps: true
              },
            } 
        });

        view.ui.add(basemapGallery, "bottom-left");

        var attractionRenderer = {
            type: "simple",
            symbol: {
              type: "picture-marker",
              url: "https://cdn2.iconfinder.com/data/icons/dark-action-bar-2/96/camera-512.png",
              width: "25px",
              height: "25px"
            }
        }
        
        var popupAttraction = {
            "title": "<b>{name}</b>",
            "content": "<b>Price:</b> {price} RON/person<br><b>Stars:</b> {stars}<br><b>Information:</b> {information}"
        }

        var transportRenderer = {
            type: "simple",
            symbol: {
              type: "picture-marker",
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pictograms-nps-misc-metro_station-2.svg/1024px-Pictograms-nps-misc-metro_station-2.svg.png",
              width: "18px",
              height: "18px"
            }
        }
        
        var popupTransport = {
            "title": "<b>{name}</b>",
            "content": "<b>Price:</b> {cost} RON/person<br><b>Type:</b> {type}<br><b>Availability:</b> {availability}<br><b>Information:</b> {information}"
        }

        var track = new Track({
            view: view,
            graphic: new Graphic({
              symbol: {
                type: "simple-marker",
                size: "12px",
                color: "green",
                outline: {
                  color: "#efefef",
                  width: "1.5px"
                }
              }
            }),
            useHeadingEnabled: false
          });
        view.ui.add(track, "top-left");

        $.ajax({
            url: urlAttractions,
            type: 'GET',
            success: function(result) {
				updateTable(result, undefined, "attractions");
                var aux = new FeatureLayer({
                    source: result,
                    fields: [{
                        name: "ObjectID",
                        alias: "ObjectID",
                        type: "oid"
                    }, {
                        name: "name",
                        alias: "name",
                        type: "string"
                    }, {
                        name: "price",
                        alias: "price",
                        type: "integer"
                    }, {
                        name: "stars",
                        alias: "stars",
                        type: "integer"
                    }, {
                        name: "object_type",
                        alias: "object_type",
                        type: "string"
                    }],
                    objectIdField: "ObjectID",
                    renderer: attractionRenderer,
                    popupTemplate: popupAttraction
                });
                layer = aux;
                attractions = result;
                map.add(aux);
            },
            error: function(error) {
                console.log('Error ${error}');
            }
        })

        $.ajax({
            url: urlTransport,
            type: 'GET',
            success: function(result) {
				updateTable(result, undefined, "transport");
                var aux = new FeatureLayer({
                    source: result,
                    fields: [{
                        name: "ObjectID",
                        alias: "ObjectID",
                        type: "oid"
                    }, {
                        name: "name",
                        alias: "name",
                        type: "string"
                    },
					{
                        name: "availability",
                        alias: "availability",
                        type: "string"
                    }, {
                        name: "type",
                        alias: "type",
                        type: "string"
                    }, {
                        name: "object_type",
                        alias: "object_type",
                        type: "string"
                    }],
                    objectIdField: "ObjectID",
                    renderer: transportRenderer,
                    popupTemplate: popupTransport
                });
                layer2 = aux;
                transport = result;
                map.add(aux);
            },
            error: function(error) {
                console.log('Error ${error}');
            }
        })

        $("#price").on("change paste keyup", function() {
            let number = 0;
            if ($(this).val() !== "") {
                number = $(this).val();
            }

            let expresion = filterExpresion + number;

            if ($('#transportFilter').prop('checked') === true) {
            	filterLayer(expresion, layer);
            }

            if ($('#attractionsFilter').prop('checked') === true) {
            	filterLayer(expresion, layer2);
            }
            updateTable(transport, number, "transport");
            updateTable(attractions, number, "attractions");
        });

        $('#transportFilter').click(function() {
            console.log("transportFilter");
        	filterSwitch(layer, layer2, "#transportFilter");
        });

        $('#attractionsFilter').click(function() {
            console.log("attractionsFilter");
        	filterSwitch(layer, layer2, "#attractionsFilter");
        });

        $('#noFilter').click(function() {
            console.log("noFilter");
        	filterSwitch(layer, layer2, "#noFilter");
        });

        $('#goToCenter').click(function() {
            console.log("goToCenter");
        	goToCenter();
        });
    });

$(function() {
    $('#transport-list').change(function() {
        var isChecked = $(this).prop('checked');
        var transport = document.getElementById('transport');
        var titleTransport = document.getElementById('title-transport');
        transport.style.display = isChecked ? 'table' : 'none';
        titleTransport.style.display = isChecked ? 'table' : 'none';
    })
    $('#attractions-list').change(function() {
        var isChecked = $(this).prop('checked');
        var attractions = document.getElementById('attractions');
        var titleAtractions = document.getElementById('title-attractions');
        attractions.style.display = isChecked ? 'table' : 'none';
        titleAtractions.style.display = isChecked ? 'table' : 'none';
    })

})

function updateTable(items, price, type) {
    let tr = '';
    let result = [];

	if (price !== undefined && type != "transport") {
		result = items.filter(value => value.attributes.price > price);
	} else {
		result = items;
	}
	
	result.forEach(function(value, index) {
    	if (type == "transport")
            tr += `<tr><th scope="row">${index}</th><td>${value.attributes.ObjectID}</td><td>${value.attributes.type}</td><td>${value.attributes.availability}</td></tr>`;
        else if (type == "attractions")
            tr += `<tr><th scope="row">${index}</th><td>${value.attributes.ObjectID}</td><td>${value.attributes.price}</td><td>${value.attributes.stars}</td></tr>`;
    });
    
    if (type === "transport") {
	    document.querySelector('#transport tbody').innerHTML = tr;
    } else if (type === "attractions") {
        document.querySelector('#attractions tbody').innerHTML = tr;
    }
}

function filterLayer(expresion, layer) {
	view.whenLayerView(layer).then(function(featureLayerView) {
    	featureLayerView.filter = {
        	where: expresion
        };
    });
}

function goToCenter() {
    view.center = [-123.12, 49.28];
    view.zoom = 12;
}

function filterSwitch(layer1, layer2, filter) {
    if (filter == "#attractionsFilter") {
        filterLayer(attractionsFilter, layer);
        filterLayer(attractionsFilter, layer2);
    } else if (filter == "#transportFilter") {
        filterLayer(transportFilter, layer);
        filterLayer(transportFilter, layer2);
    } else {
        filterLayer(attractionsFilter, layer);
        filterLayer(transportFilter, layer2);
    }
}
