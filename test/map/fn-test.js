var linen = require("../.."),
expect = require("expect.js");

describe("map/fn#", function() {
  it("can change a value in a model", function() {

    var m = linen.schema({
      name: {
        $type: "string",
        $map: function(abba) {
          return String(abba).toUpperCase();
        }
      }
    }).model({ name: "abba" });


    expect(m.get("name")).to.be("ABBA");
  });

  it("can setup a map on the root field", function() {
    var m = linen.schema({
      $map: function() {
        return {
          name: "craig"
        }
      }
    }).model();

    expect(m.get("name")).to.be("craig");
  })
})