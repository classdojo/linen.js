var linen = require("linen");

var api = linen({
  map: {
    people: {
      name: "person",
      schema: {
        first_name: "string",
        last_name: "string",
        location: { $ref: "location" }
      }
    },
    location: {
      schema: {
        first_name: "string",
        last_name: "string"
      }
    }
  }
})