
var sift = require("sift"),
_cid = 0,
_ = require("underscore"),
outcome = require("outcome");

outcome.logAllErrors(true)

var collections = {
  "people": [
    {
      _id: "craig",
      first_name: "craig",
      last_name: "condon",
      location: "sf",
      friends: ["sam", "tim", "liam", "frank", "mitch"]
    },
    {
      _id: "sam", 
      first_name: "Sam",
      last_name: "C",
      location: "sf",
      friends: ["craig", "liam", "frank"]
    },
    {
      _id: "tim", 
      first_name: "Sam",
      last_name: "C",
      location: "stpl",
      friends: ["mitch", "craig"]
    },
    {
      _id: "mitch",
      first_name: "Mitch",
      last_name: "C",
      location: "stpl",
      friends: ["tim", "craig"]
    },
    {
      _id: "liam", 
      first_name: "Sam",
      last_name: "C",
      location: "sf",
      friends: ["craig", "sam", "frank"]
    },
    {
      _id: "frank", 
      first_name: "Frank",
      last_name: "C",
      location: "sf",
      friends: ["craig", "liam", "sam"]
    }
  ],
  "locations": [
    {
      "_id": "sf",
      "name": "San Francisco",
      "state": "CA",
      "zip": 94102
    },
    {
      "_id": "stpl",
      "name": "Minneapolis",
      "state": "MN",
      "zip": 55124
    }
  ]
}

linen = require("../../");


module.exports = linen({

  schemas: {
    "person": {
      "first_name": "string",
      "last_name": "string",
      "location": { $ref: "location", $map: "location" },
      "friends": [ { $ref: "person", $route: "people" }],
      "hobbies": [ { $ref: "hobby" }]
    },
    "hobby": {
      "name": "string"
    },
    "location": {
      "city": "string",
      "state": "string",
      "zip": { $type: "number", $is: /\d{5}/ }
    }
  },

  routes: {
    "people": {
      "schema": "person",
    },
    "hobbies": {
      "schema": "hobby"
    },
    "location": {
      "schema": "location"
    }
  },

  transport: {
    request: function(options, callback) {


      if(!/PUT|PATCH|DELETE|POST|GET/.test(String(options.method))) {
        return callback(new Error("method " + options.method + " doesn't exist"));
      }


      var items = collections[options.collection],
      item;

      if(!items) {
        return callback(new Error("collection " + options.collection + " doesn't exist - route " + options.path));
      }

      if(_.keys(options.query).length) {
        items = sift(options.query, items);
      }

      if(options.itemId) {
        item = sift({ _id: options.itemId }, items).pop()
      } else {
        return callback(null, _clone(items));
      }

      if(!item) {
        return callback(new Error("item " + options.itemId + " doesn't exist"));
      }

      //simulate CRUD methods
      if(options.method == "POST") {
        options.data._id = ++_cid;
        items.push(options.data);
      } else 
      if(options.method == "PUT") {
        for(key in options.data) {
          item[key] = options.data[key];
        }
      } else
      if(options.method == "DELETE") {
        items.splice(items.indexOf(item), 1);
      }

      callback(null, _clone(item))
    }
  }
});

function _clone(object) {
  return JSON.parse(JSON.stringify(object));
}

