Linen (line-in) maps API's to [bindable](/classdojo/bindable.js) `objects`, and `collections`. At classdojo, we use `linen` to abstract our API from front-end, so we don't necessarily depend on any sort of API while developing new components. This allows us to rapidly build prototypes which can be wired up later. 


Here's an example schema definition of a person schema:

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

To use the schema, simply call the following:

```javascript
var person  = linen.model("person"),  //creates a new person
existingPerson = linen.model("person", "someId"); //some ID
```

Linen works by overriding the `bind` method to fetch from any API you have setup, so when you call:

```javascript

//calls GET /people/someId
existingPerson.bind("name").to(function(name) {
  console.log(name); 
});
```

The `existingPerson` will asynchronously call `.to(fn)` when it's been fetch from the server. This is useful when data-binding to any sort of UI component, such as [rivets.js](http://rivetsjs.com/), or [paperclip.js](classdojo/paperclip.js).

You can just as easily bind the `existingPerson`'s friends. For instance:

```javascript

// GET /people/someId/friends
existingPerson.bind("friends").to(function(friends) {

  // GET /people/friendId
  friends.at(0).bind("name").once().to(function(name) {
  });
});

