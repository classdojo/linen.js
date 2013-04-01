
var expect = require("expect.js"),
api = require("./helpers/api");

describe("linen", function() {

  var items = {};

  it("can create the route mappings", function() {

    //people
    items.craig  = api.item("people", { _id: "craig" });

    return;

    //people/:craig/friends

    items.people = api.route("person").collection();
    items.craigsFriends = items.craig.get("friends");
    items.tim  = api.route("person").item({ first_name: "tim" })
    items.timsFriends = items.tim.friends;
  });

  it("can fetch craig", function(next) {
    items.craig.fetch(function() {
      expect(items.craig.get("first_name")).to.be("craig");
      expect(items.craig.get("last_name")).to.be("condon");
      next();
    });
  });

  it("can fetch craig's friends", function(next) {
    items.craigsFriends.fetch(function() {
      items.craigsFriends.at(0).get("location").fetch();
      expect(items.craigsFriends.at(0).get("location.city")).to.be("sf");
      next();
    });
  })
});