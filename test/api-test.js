
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

  it("can fetch all the people", function(next) {
    items.people.fetch(function() {
      expect(items.people.at(1).get("first_name")).to.be("Sam");
      next();
    })
  })

  it("can fetch craig", function(next) {
    items.craig.fetch(function() {
      expect(items.craig.get("first_name")).to.be("craig");
      expect(items.craig.get("last_name")).to.be("condon");
      next();
    });
  });

  //even when friends is present, linen collections should remove the references
  //until they're FULLY loaded.
  it("craig's friends collection is empty", function() {
    expect(items.craigsFriends.length()).to.be(0);
  })

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

    //bind should ONLY be called once 

    var i = 0;
    var binding = items.craigsFriends.first().get("friends").last().get("friends").bind();
    binding.to(function(command, item) {
      expect(item.get("first_name")).not.to.be(undefined);
      if(i++ > 1) {
        next();
      }
    });
  });

  it("craig can add a new friend", function(next) {
    var jake = items.craigsFriends.item({name:"jake"});
    //console.log(jake.requestOptions)
    next();
  });



});