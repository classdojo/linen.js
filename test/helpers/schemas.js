var api = require("./api"),
linen   = require("../..")();


linen.addSchema({
  name: "person",
  fields: {
    "first_name" : { $type: "string", $required: true },
    "last_name"  : { $type: "string", $required: true },
    "location"   : { $ref: "location"                 },
    "friends"    : [{ $ref: "person" }],
    "hobbies"    : [{ $ref: "hobby"  }]
  }
});


linen.addSchema({
  name: "hobby",
  fields: {
    "name": "string"
  }
});

linen.addSchema({
  name: "location",
  fields: {
    "city": "string",
    "state": "string",
    "zip": { $type: "number", $is: /\d{5}/ }
  }
});

linen.addSchema({
  name: "all",
  fields: {
    "people": [{ 
      $ref: "person",
      $fetch: function(options, next) {
        console.log(options);
      }
    }]
  }
})



module.exports = linen;