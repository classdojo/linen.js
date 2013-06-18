var collections = require("./data"),
vine            = require("vine"),
sift            = require("sift");

function getPerson(req) {
  return sift({ _id: req.params.person }, collections.people).shift();
}

function findPeople(search) {
  return sift(search, collections.people);
}

module.exports = function(router) {
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
      res.end(vine.result(getPerson({ params: { person: req.params.friend }})))
    },
    "pull -method=DELETE people/:person": function(req, res) {
      var person = getPerson(req);
      collections.people.splice(collections.people.indexOf(person), 1);
      res.end(vine.result(person));
    }
  });
}