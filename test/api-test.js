
var expect = require("expect.js"),
api = require("./helpers/api");

describe("linen", function() {

  var items = {};

  it("can create the route mappings", function() {

    //people
    items.craig  = api.item("people", { _id: "craig" });
    items.people = api.collection("people");
    items.craigsFriends = items.craig.get("friends");
    //items.tim = api.collection("people").findOne({ first_name: "tim" })
    //items.timsFriends = items.tim.friends;
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
      items.craigsFriends.first().get("location").fetch();
      expect(items.craigsFriends.first().get("location.name")).to.be("Palo Alto");
      next();
    });
  });

  it("can fetch craig's first friend's friends", function(next) {
    items.craigsFriends.at(0).get("friends").fetch(function() {
      var craigsFirstFriendsFriend = items.craigsFriends.at(0).get("friends").last();
      expect(craigsFirstFriendsFriend.get("first_name")).to.be("Frank");
      expect(craigsFirstFriendsFriend.get("last_name")).to.be("C");
      next();
    });
  });

  it("can find craig's frist friend's friend's friends", function(next) {

    var i = 0;
    items.craigsFriends.first().get("friends").last().get("friends").bind(function(command, item) {
      expect(item.get("first_name")).not.to.be(undefined);
      if(i++ > 1)
      next();
    });
  })
});