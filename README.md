```javascript
var linen = require("linen"){};

linen.addSchema({
  name: "person",
  fields: {
    first_name: "string",
    last_name: "string",
    full_name: {
      $get: function(model) {
        return model.get("first_name") + " " + model.get("last_name");
      },
      $set: function(model, value) {
        var nameParts = String(value).split(" ")
        model.set("first_name", nameParts.shift());
        model.set("last_name", nameParts.join(" "));
      },
      $bind: ["first_name", "last_name"]
    },
    friends: [{
      $ref: "person",
      $fetch: function(payload, next) {
        transport.fetch(payload.method, "/people/" + payload.model.get("_id") + "/friends", next);
      }
    }]
  },
  fetch: function(payload, next) {
    transport.fetch(payload.method, "/people/" + (payload.model.get("_id") || ""), next);
  }
});

var person = linen.model("person", {
  first_name: "John",
  last_name: "Doe"
});

console.log(person.isNew()); //true
console.log(person.get("full_name")); //John Doe

//POST /people
person.save(function() {
  
});
