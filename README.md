Linen (line-in) maps API's to [bindable](/classdojo/bindable.js) `objects`, and `collections`. At [classdojo](http://classdojo.com), we use `linen` to abstract our API from front-end, so we don't necessarily depend on any sort of API while developing new components. This allows us to rapidly build prototypes which can be wired up later. 


Here's an example person schema:

```javascript
var linen = require("linen")();

linen.addSchema({
  name: "person",
  fields: {
    firstName: "string",
    lastName: "string",
    fullName: {
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
existingPerson.bind("firstName").to(function(name) {
  console.log(name); 
}).now();
```

The `existingPerson` will asynchronously call `.to(fn)` when it's been loaded from the server. This is useful when data-binding to any sort of UI component, such as [rivets.js](http://rivetsjs.com/), or [paperclip.js](classdojo/paperclip.js).

Here's another example of data-binding to `linen` models:

```javascript

// GET /people/someId/friends
existingPerson.bind("friends").to(function(friends) {

  // GET /people/friendId
  friends.at(0).bind("firstName").once().to(function(name) {
  }).now();
}).now();
```

The above examples make it easy to abstract models from any API. To demonstrate this, here's an example of using `dummy data`:


```javascript
var existingPerson = new bindable.Object({
  firstName: "Ron",
  lastName: "Burgundy",
  friends: [
    new bindable.Object({
      firstName: "Brian",
      lastName: "Fontana"
    }),
    new bindable.Object({
      firstName: "Brick",
      lastName: "Tamland"
    }),
    new bindable.Object({
      firstName: "Champ",
      lastName: "Kind"
    })
  ]
});


existingPerson.bind("firstName").to(function(name) {
  console.log(name); //Ron 
}).now();

existingPerson.bind("friends").to(function(friends) {
  friends.at(0).bind("firstName").once().to(function(name) {
    console.log(name); //Brian
  }).now();
}).now();
```


### API

#### linen()

Returns a new linen instance

#### linen.addSchema(definition)

adds a new schema

#### definition

Inspired by [mongoose](http://mongoosejs.com/):

```javascript
linen.addSchema({
  firstName: {

  }
});
```

#### linen.model(schemaName[, modelId ])

returns a new, or existing model




