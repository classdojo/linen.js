var linen = require("../.."),
expect = require("expect.js");

/*

field: [{
  $ref: "person"
}]

*/

describe("map/reference collection#", function() {
  
  var l = linen();

  l.schema("person", {
    firstName: "string",
    lastName: "string",
    friends: [{
      $ref: "person"
    }]
  });

  /**
   */

  it("properly maps objects as ref models", function() {

    var m = l.model("person", {
      firstName: "string",
      friends: [{
        firstName: "frank"
      },{
        firstName: "sam"
      }]
    });

    expect(m.get("friends").at(0).schema.name).to.be("person");
    expect(m.get("friends").at(0).get("firstName")).to.be("frank");
  });
});