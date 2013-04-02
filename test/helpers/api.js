
var sift = require("sift"),
_cid = 0,
_ = require("underscore"),
outcome = require("outcome"),
beanpoll = require("beanpoll"),
vine = require("vine"),
verify = require("verify");


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

function getPerson(req) {
  return sift({ _id: req.params.person }, collections.people).shift();
}

function findPeople(search) {
  return sift(search, collections.people);
}

router.on({
  "pull -method=GET people": function(req, res) {
    res.end(vine.result(collections.people));
  },
  "pull -method=POST people": function(req, res) {
    var body = req.query.body;

    if(findPeople({ first_name: body.first_name }).length) {
      return res.end(vine.error("user already exists"));
    }

    _.defaults(body, {
      _id: body.first_name,
      friends: [],
      hobbies: []
    });

    collections.people.push(body);
    res.end(vine.result(body))
  },
  "pull -method=GET people/:person": function(req, res) {
    res.end(vine.result(getPerson(req)));
  },
  "pull -method=PUT people/:person": function(req, res) {
    
    var person = getPerson(req);
    
    for(var key in req.query.body) {
      person[key] = req.query.body[key]
    }

    res.end(vine.result(person));
  },
  "pull -method=GET locations/:location": function(req, res) {
    res.end(vine.result(sift({ _id: req.params.location }, collections.locations).shift()));
  },
  "pull -method=GET people/:person/friends": function(req, res) {
    var person = getPerson(req);
    var friends = findPeople({ _id: {$in: person.friends }});
    res.end(vine.result(friends));
  },
  "pull -method=POST people/:person/friends": function(req, res) {
    var person = getPerson(req),
    body = req.query.body;

    if(!person) return res.end(vine.error("person does not exist"));
    person.friends.push(body._id);
    res.end(vine.result(body));
  },
  "pull -method=DELETE people/:person/friends/:friend": function(req, res) {
    var person = getPerson(req);
    if(!person) return res.end(vine.error("person does not exist"));
    var friendIndex;
    var friend = person.friends[friendIndex = person.friends.indexOf(req.params.friend)]
    if(!friend) return res.end(vine.error("friend does not exist"));
    person.friends.splice(friendIndex, 1);
    vine.result(getPerson({ params: { person: req.params.friend }}))
  }
});


module.exports = linen({

  routes: {
    "people": {
      "name": "person",
      "schema": {
        "first_name": { $type: "string", $required: true },
        "last_name": { $type: "string", $required: true },
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
    function next() {
      var args = arguments, self = this;

      //simulate API latency
      setTimeout(function() {
        callback.apply(self, args);
      }, 10);
    }
    if(data.errors) {
      next(new Error(data.errors[0].message));
    } else {
      next(null, _clone(data.result));
    }
  },

  transport: {
    request: function(options, callback) {


      if(!/PUT|PATCH|DELETE|POST|GET/.test(String(options.method))) {
        return callback(new Error("method " + options.method + " doesn't exist"));
      }

      console.log("%s %s", options.method, options.path)

      router.
      request(options.path).
      tag({ method: options.method }).
      query({ data: options.query, body: options.body }).
      pull(callback);

    }
  }
});

function _clone(object) {
  return JSON.parse(JSON.stringify(object));
}

