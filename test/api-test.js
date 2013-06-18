var schemas = require("./helpers/schemas");


describe("linen", function() {

  var items = {};


  it("can create the route mappings", function() {
    items.craig         = schemas.model("person", "craig");
    items.people        = schemas.model("all").get("people");
    items.craigsFriends = items.craig.get("friends");
  });

  it("can fetch all the people", function() {
    items.people.fetch(function(err) {
      expect(items.people.at(1).get("first_name")).to.be("Sam");
      next();
    })
  });

});