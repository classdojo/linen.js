var linen = require("../.."),
expect = require("expect.js");

describe("map/complex collection#", function() {
  
  var s = linen.schema({
    friends: [{
      name: "string"
    }]
  });

  /**
   */

  it("creates a complex collection when a model is created", function() {
    expect(s.model().get("friends").__isCollection).to.be(true);
  });

  /**
   */

  it("allows for vanilla objects", function() {
    var friends = s.model({ friends: [{name:"craig" }]}).get("friends");
    expect(friends.at(0).name).to.be("craig");
  });
});