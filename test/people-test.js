var api = require("./api"),
expect = require("expect.js");

describe("person", function() {

  var craig, sam, craigsFriends, craigsHobbies, cooking;

  it("craig can be fetched as a model", function() {
    craig = api.model("person", "craig");
    expect(craig.get("_id")).to.be("craig");
  });

  return;


  it("has added all collections to craig", function() {
    expect(craig.get("hobbies").__isCollection).to.be(true);
    expect(craig.get("friends").__isCollection).to.be(true);
    expect(craig.get("profession").__isModel).to.be(true);
    expect(craig.get("city").__isModel).to.be(true);
  });

  it("craig's friends can be fetched", function(next) {
    craig.bind("friends.length").to(function(count) {

      if(count == 0) return;

      var friends = craig.get("friends");
      craigsFriends = friends;
      expect(friends).not.to.be(undefined);
      expect(friends.__isCollection).to.be(true);
      next();

    }).limit(2).now();
  });

  it("has not fetched anything other than craig's friends", function() {

      //don't fetch self
      expect(craig.get("name")).to.be(undefined);

      //or virtual properties
      expect(craig.get("city.name")).to.be(undefined);
      expect(craig.get("profession.description")).to.be(undefined);

      //or collections
      expect(craig.get("hobbies").length()).to.be(0);

      //except friends
      expect(craig.get("friends").length()).not.to.be(0);
  });

  it("can fetch just craig", function(next) {
    craig.bind("name").to(function(name) {
      expect(name).not.to.be(undefined);
      expect(craig.get("hobbies").length()).to.be(0);
    }).once().now();
  });

  it("can fetch craig's first friend", function(next) {
    expect((sam = craigsFriends.at(0)).get("_id")).to.be("sam");
    sam.bind("name").to(function(name) {
      expect(name.first).to.be("sam");
      expect(name.last).to.be("c");
      next();
    }).once().now();
  });
});