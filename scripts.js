let transport = [];
let attractions = [];

var layer = null;
var layer2 = null;

const urlAttractions = 'http://localhost:3000/attractions';
const urlTransport = 'http://localhost:3000/transport';

let onExpresion = "price > 0";
let falseExpresion = "price < 0";
let filterExpresion = "price > ";

var view;

require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer"
    ],
    function(
        Map,
        MapView,
        FeatureLayer
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
                        name: "price",
                        alias: "price",
                        type: "integer"
                    }],
                    objectIdField: "ObjectID"
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
                        name: "age",
                        alias: "age",
                        type: "integer"
                    },
					{
                        name: "cost",
                        alias: "cost",
                        type: "integer"
                    }],
                    objectIdField: "ObjectID"
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

            filterLayer(expresion, layer);

            // if ($('#rest').prop('checked') === true) {
            // 	filterLayer(expresion, layer);
            // }
            
            updateTable(transport, number, "transport");
            updateTable(attractions, number, "attractions");
        });

        // $('#obj').change(function() {
        // 	filterSwitch(layer2, $(this).prop('checked'));
        // });

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

function filterSwitch(layer, option) {
    if (option === false) {
       	filterLayer(falseExpresion, layer)
    } else {
     	filterLayer(onExpresion, layer);
    }
}
