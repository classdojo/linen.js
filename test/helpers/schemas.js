var api = require("./api"),
linen   = require("../..")();


linen.addSchema({
  name: "person",
  fields: {
    "first_name" : { $type: "string", $required: true },
    "last_name"  : { $type: "string", $required: true },
    "location"   : { $ref: "location"                 },
    "friends"    : [{ 
      $ref: "person",
      $fetch: api.route({
        path: function(payload, next) {
          return "/people/" + payload.model.get("_id") + "/friends/" + (/DELETE/.test(payload.method) ? payload.target.get("_id") : "");
        }
      })
    }],
    "hobbies"    : [{ 
      $ref: "hobby",
      $fetch: api.route({
        path: function(payload, next) {
          return "/people/" + payload.model.get("_id") + "/hobbies/";
        }
      })
    }]
  },
  fetch: api.route(),
  path: function(model) {
    return "/people/" + (model.get("_id") || "");
  }
});


linen.addSchema({
  name: "hobby",
  fields: {
    "name": "string"
  },
  fetch: api.route({
    inheritPath: true
  }),
  path: function(model) {
    return "/hobbies/" + (model.get("_id") || "");;
  }
});

linen.addSchema({
  name: "location",
  fields: {
    "city": "string",
    "state": "string",
    "zip": { $type: "number", $is: /\d{5}/ }
  },
  fetch: api.route({
    path: function(payload, next) {
      return "/locations/" + payload.model.get("_id");
    }
  })
});

linen.addSchema({
  name: "all",
  fields: {
    "people": [{ 
      $ref: "person",
      $fetch: api.route({
        path: function(payload, next) {
          return "/people/" + (/DELETE/.test(payload.method) ? payload.model.get("_id") : "")
        }
      })
    }]
  }
})



module.exports = linen;