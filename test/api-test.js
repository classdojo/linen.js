
var expect = require("expect.js"),
api = require("./helpers/api");

describe("linen", function() {

  var items = {};

  it("can create the route mappings", function() {

    items.craig = api.collection("people").item("craig");

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
  });


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
  });



  it("can fetch craig's friends", function(next) {
    items.craigsFriends.fetch(function() {
      items.craigsFriends.last().get("location").fetch();
      expect(items.craigsFriends.last().get("location.name")).to.be("Palo Alto");
      next();
    });
  });

  it("can fetch craig's first friend's friends", function(next) {
    items.craigsFriends.last().get("friends").fetch(function() {
      var craigsFirstFriendsFriend = items.craigsFriends.last().get("friends").first();
      expect(craigsFirstFriendsFriend.get("first_name")).to.be("Frank");
      expect(craigsFirstFriendsFriend.get("last_name")).to.be("C");
      next();
    });
  });


  it("can find craig's frist friend's friend's friends", function(next) {

    //bind should ONLY be called once 

    var i = 0;
    var binding = items.craigsFriends.last().get("friends").first().get("friends").bind();
    binding.to(function(command, item) {
      expect(item.get("first_name")).not.to.be(undefined);
      if(i++ > 1) {
        next();
      }
    });
  });
  return;


  it("cannot add friend to craig collection", function(next) {
    var err;
    try {
      var jake = items.craigsFriends.item({name:"jake"});
    } catch(e) {
      err = e;
    }
    expect(err).not.to.be(undefined);
    next();
  });

  it("can add jake as a person", function(next) {
    items.people.item({name:"craig"}).save(next);
  });

  it("can add jake as a friend to craig", function() {
    items.craigsFriends.push(items.people.last());
  })



});