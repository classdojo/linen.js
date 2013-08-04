Linen (line-in) maps API's to [bindable](/classdojo/bindable.js) `objects`, and `collections`. 

## Motivation

- Makes it easy to build components without being concerned about how they interact with the backend.
- Makes it easy to build prototypes that work without a backend.
- Allows for front-end / backend to be built in parallel.
- Encapsulates your service layer, and makes your application more more maintainable. 
- reduces the amount of calls to the backend - only makes calls which are necessary.
- Easily build front-end fixtures that work with selenium tests.



Here's an example person schema:

```javascript
var linen = require("linen")();

linen.schema({

  // name of the schema - gets referenced by 
  // linen.model("person")
  $name: "person",

  //fields for the person. Keep in mind that model properties
  //get *validated* against their coresponding field. 
  firstName: "string",
  lastName: "string",

  //virtual property
  fullName: {
    $get: function() {
      return @get("firstName") + " " + @get("lastName");
    },
    $set: function(value) {
      var nameParts = String(value).split(" ")
      @set("firstName", nameParts.shift());
      @set("lastName", nameParts.join(" "));
    },
    $bind: ["firstName", "lastName"]
  },


  //fetches GET /people/:personId when
  //person.bind(property).to(fn) is called
  $fetch: {
    get: function(payload, next) {
      transport.get("/people/" + payload.model.get("_id"), next);
    }
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




