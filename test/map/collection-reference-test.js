var linen = require("../.."),
expect = require("expect.js");

describe("map/reference collection#", function() {
  
  var l = linen();

  l.schema("person", {
    firstName: "string",
    lastName: "string",
    friends: [{
      $ref: "person"
    }],
    hobbies: [{
      $ref: "hobby"
    }]
  });

  l.schema("hobby", {
    name: "string",
    desc: "string"
  });

  /**
   */

  it("properly maps objects as ref models", function() {

    var m = l.model("person", {
      firstName: "string",
      friends: [{
        name: "frank"
      },{
        name: "sam"
      }]
    });

    expect(m.get("friends").at(0).schema.name).to.be("person");
  });
});