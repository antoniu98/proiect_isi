const express = require('express');
const MongoClient = require("mongodb").MongoClient;

const app = express();
const port = 3000;
const dbConnectionUrl = "mongodb+srv://isi_user:isi_password@clusterfree.qjam6.mongodb.net/isi_db?retryWrites=true&w=majority";

class Item {
  constructor(value, colorValue) {
    this.geometry = {
        type : "point",
        x : value.x,
        y : value.y,
        symbol : {
            color: colorValue
        }
    };
    this.attributes = {
        ObjectID : value._id,
        name : value.name,
        object_type : value.object_type,
        type : value.type,
        availability : value.availability,
        price : value.price,
        stars : value.stars
    };
  }
}

function initialize(
    dbName,
    dbCollectionName,
    successCallback,
    failureCallback
) {
    MongoClient.connect(dbConnectionUrl, {useUnifiedTopology: true}, function(err, dbInstance) {
        if (err) {
            console.log(`[MongoDB connection] ERROR: ${err}`);
            failureCallback(err);
        } else {
            const dbObject = dbInstance.db(dbName);
            const dbCollection = dbObject.collection(dbCollectionName);
            console.log("[MongoDB connection] SUCCESS");

            successCallback(dbCollection);
        }
    });
}

app.get('/attractions', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	initialize('isi_db', 'attractions', function(dbCollection) {
        dbCollection.find().toArray(function(err, result) {
            if (err)
            	throw err;
            let items = [];
            result.forEach((value, index) => {
                value._id = index + 1;
                items.push(new Item(value, [226, 119, 40]));
            });
            items.sort((a, b) => parseFloat(a.attributes.cost) - parseFloat(b.attributes.cost));
            res.end(JSON.stringify(items))
        });
    }, function(err) {
        throw (err);
    });
});

app.get('/transport', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	initialize('isi_db', 'transport', function(dbCollection) {
        dbCollection.find().toArray(function(err, result) {
            if (err)
            	throw err;
            let items = [];
            result.forEach((value, index) => {
                console.log(value.x);
                console.log(value["x"]);
                value._id = index + 1;
                items.push(new Item(value, [19, 100, 140]));
            });
            items.sort((a, b) => parseFloat(a.attributes.cost) - parseFloat(b.attributes.cost));
   			res.end(JSON.stringify(items))
        });
    }, function(err) {
        throw (err);
    });
});

app.use(express.static('./'));

app.listen(port, () => console.log(`listening on port ${port}!`));
