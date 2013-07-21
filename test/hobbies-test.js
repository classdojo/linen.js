var api = require("./api"),
expect = require("expect.js");

describe("hobbies", function() {

  var craig, hobbies, cooking;

  it("can fetch craig as a person", function() {
    craig = api.model("person", "craig");
  });

  it("can fetch craigs hobbies", function(next) {
    expect(craig.get("hobbies").length()).to.be(0);
    craig.bind("hobbies.length").to(function() {
      expect((cooking = craig.get("hobbies").at(0)).get("name")).to.be("cooking");
      next();
    }).once();
  });

  it("cooking can fetch the people that has the hobbies", function(next) {
    cooking.bind("people.length").to(function() {
      expect(cooking.get("people").at(1).get("_id")).to.be("tim");

      //not fetched - shouldn't exit.
      expect(cooking.get("people").at(1).get("name")).to.be(undefined);
      next();
    }).once();
  })
});