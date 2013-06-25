Linen (line-in) maps API's to [bindable](/classdojo/bindable.js) `objects`, and `collections`. At classdojo, we use `linen` to abstract our API from front-end, so we don't necessarily depend on any sort of API while developing new components. This allows us to rapidly build prototypes which can be wired up later.

Here's an example schema definition of a person model:

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
```
