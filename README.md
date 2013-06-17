```javascript
var linen = require("linen");

var personSchema = new linen.Schema({
  name: "",
  fields: {
    name: {

    },
    friends: [{ $ref: "person" }]
  },

  route: "/person/:_id",
  virtual: {
    friends: true
  }
});


linen.use({
  schemas: {
    person: personSchema
  }
});


person = linen.item("person", "me");

//GET /person/me/friends
person.bind("friends").to(function() {
  
})
