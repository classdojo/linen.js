
var sift = require("sift"),
_cid = 0,
_ = require("underscore"),
outcome = require("outcome"),
beanpoll = require("beanpoll"),
vine = require("vine");

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
      location: "pa",
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
    },
    {
      "_id": "pa",
      "name": "Palo Alto",
      "state": "CA",
      "zip": 99999
    }
  ]
}

linen = require("../../");

var router = beanpoll.router();

router.on({
  "pull -method=GET people": function(req, res) {
    res.end(vine.result(collections.people));
  },
  "pull -method=POST people": function(req, res) {

  },
  "pull -method=GET people/:person": function(req, res) {
    res.end(vine.result(sift({ _id: req.params.person }, collections.people).shift()));
  },
  "pull -method=PUT people/:person": function(req, res) {

  },
  "pull -method=GET locations/:location": function(req, res) {
    res.end(vine.result(sift({ _id: req.params.location }, collections.locations).shift()));
  },
  "pull -method=GET people/:person/friends": function(req, res) {
    var person = sift({ _id: req.params.person }, collections.people).shift();
    var friends = sift({ _id: {$in: person.friends }}, collections.people);
    res.end(vine.result(friends));
  }
});


module.exports = linen({

  routes: {
    "people": {
      "name": "person",
      "schema": {
        "first_name": "string",
        "last_name": "string",
        "location": { $ref: "location", $route: { path: "locations" } },
        "friends": [{ $ref: "person", $route: { path: "people", inherit: false } }],
        "hobbies": [{ $ref: "hobby", $route: { static: true, inherit: false } }]
      }
    },
    "hobbies": {
      "name": "hobby",
      "schema": {
        "name": "string"
      }
    },
    "locations": {
      "name": "location",
      "schema": {
        "city": "string",
        "state": "string",
        "zip": { $type: "number", $is: /\d{5}/ }
      }
    }
  },


  mapResponse: function(response, callback) {
    var data = response.data;
    if(data.errors) {
      callback(data.errors[0]);
    } else {
      callback(null, _clone(data.result));
    }
  },

  transport: {
    request: function(options, callback) {


      if(!/PUT|PATCH|DELETE|POST|GET/.test(String(options.method))) {
        return callback(new Error("method " + options.method + " doesn't exist"));
      }

      console.log("GET %s", options.path)

      router.
      request(options.path).
      tag({ method: options.method }).
      pull(callback);
      return;

    }
  }
});

function _clone(object) {
  return JSON.parse(JSON.stringify(object));
}

