var linen = require("../.."),
expect = require("expect.js");


/*

field: {
  $ref: "schema"
}

*/

describe("map/reference#", function() {

  var l = linen();

  l.schema("person", {
    address: {
      $ref: "address"
    },
    friends: [{
      $ref: "person"
    }]
  });

  l.schema("address", {
    city: "string"
  });

  l.schema("country", {

  });


  /**
   */

  it("doesn't create a reference it doesn't exist", function() {
    var m = l.model("person");
    expect(m.get("address")).to.be(undefined);
  });

  /**
   */
   
  it("creates a reference if a value exists", function() {
    var m = l.model("person", {address:"abba"});
    expect(m.get("address._id")).to.be("abba");
  });

  /**
   */
   
  it("doesnt do anything to an explicit reference", function() {
    var m = l.model("person", { address: l.model("address", "abba") });
    expect(m.get("address._id")).to.be("abba");
  })

  /**
   */

  it("busts if the reference type is incorrect", function() {
    try {
      var m = l.model("person", { address: l.model("country") });
    } catch(e) {
      expect(e.message).to.be('cannot assign model type "country" to field "address" type "address"')
    }
  });

  /**
   */

  it("maintains a reference to the owner model", function() {
    var m = l.model("person", {
      name: "craig",
      friends:[{
        name: "john",
        friends: [{
          name: "sam"
        }]
      }]
    });

    expect(m.get("friends").at(0).owner).to.be(m);
    expect(m.get("friends").at(0).get("friends").at(0).owner).to.be(m.get("friends").at(0));
  })
});