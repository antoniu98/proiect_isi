let transport = [];
let attractions = [];

var layer = null;
var layer2 = null;

var transportLayer;
var attractionsLayer;

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
        "esri/widgets/Expand",
        "esri/widgets/Search",
        "esri/tasks/RouteTask",
      "esri/tasks/support/RouteParameters",
      "esri/tasks/support/FeatureSet"
    ],
    function(
        Map,
        MapView,
        FeatureLayer,
        BasemapGallery,
        Legend,
        Graphic,
        Track,
        Expand,
        Search,
        RouteTask, RouteParameters, FeatureSet
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
            "content": "<b>Price:</b> {price} RON/person<br><b>Stars:</b> {stars}<br><b>"
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
            "content": "<b>Price:</b> {price} RON/person<br><b>Type:</b> {type}<br><b>Availability:</b> {availability}"
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


        $.when(
            $.ajax({
                url: urlAttractions,
                type: 'GET',
                success: function(result) {
                    console.log(result);
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
                        title: "Attractions",
                        objectIdField: "ObjectID",
                        renderer: attractionRenderer,
                        popupTemplate: popupAttraction
                    });
                    attractionsLayer = aux;
                    layer = aux;
                    attractions = result;
                    map.add(aux);
                },
                error: function(error) {
                    console.log('Error ${error}');
                }
            }),
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
                        title: "Transport",
                        objectIdField: "ObjectID",
                        renderer: transportRenderer,
                        popupTemplate: popupTransport
                    });
                    transportLayer = aux;
                    layer2 = aux;
                    transport = result;
                    map.add(aux);
                },
                error: function(error) {
                    console.log('Error ${error}');
                }
            })
        ).then( function(data) {
            /* === Legend === */
            var legend = new Legend({    
                view: view,
                layerInfos: [
                {
                    layer: transportLayer,
                    title: "Transport"
                },
                {
                    layer: attractionsLayer,
                    title: "Attractions"
                }
                ]
            });

                const legendElement = new Expand({
                    expandIconClass: "esri-icon-legend",
                    expandTooltip: "Legend",
                    view: view,
                    content: legend,
                    expanded: false
                });
                view.ui.add(legendElement, "top-right");

                console.log("Transport layer : ");
                console.log(legend.layerInfos[0]);
        });
     
        $("[value=Legend]").click(function() {
            $(".esri-legend__layer-cell.esri-legend__layer-cell--info").get(0).innerHTML="Transport";
            $(".esri-legend__layer-cell.esri-legend__layer-cell--info").get(1).innerHTML="Attractions";   
        });
            

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


        // SEARCH WIDGET
        var searchWidget = new Search({
            view: view
          });
        view.ui.add(searchWidget, {
            position: "top-right"
          });


        // Route and direction:
        var routeTask = new RouteTask({
            url: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"
         });
   
         view.on("click", function(event){
           if (view.graphics.length === 0) {
             addGraphic("start", event.mapPoint);
           } else if (view.graphics.length === 1) {
             addGraphic("finish", event.mapPoint);
             // Call the route service
             getRoute();
           } else {
             view.graphics.removeAll();
             addGraphic("start",event.mapPoint);
           }
         });
         
         function addGraphic(type, point) {
           var graphic = new Graphic({
             symbol: {
               type: "simple-marker",
               color: (type === "start") ? "white" : "black",
               size: "8px"
             },
             geometry: point
           });
           view.graphics.add(graphic);
         }
       
         function getRoute() {
           // Setup the route parameters
           var routeParams = new RouteParameters({
             stops: new FeatureSet({
               features: view.graphics.toArray()
             }),
             returnDirections: true
           });
           // Get the route
           routeTask.solve(routeParams).then(function(data) {
             data.routeResults.forEach(function(result) {
               result.route.symbol = {
                 type: "simple-line",
                 color: [5, 150, 255],
                 width: 3
               };
               view.graphics.add(result.route); 
             });
             
           });
         }
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


