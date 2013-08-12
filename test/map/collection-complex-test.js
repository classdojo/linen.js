var linen = require("../.."),
expect = require("expect.js");

describe("map/complex collection#", function() {
  
  var s = linen.schema({
    friends: [{
      name: "string",
      age: {
        $default: 99
      }
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


  it("sets a default age for each person in a collection", function() {
    var friends = s.model({ friends: [{name:"craig" }]}).get("friends");
    expect(friends.at(0).age).to.be(99);
  })
});