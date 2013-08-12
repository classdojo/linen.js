var linen = require("../.."),
expect = require("expect.js");

/*

field: {
  $map: function() { }
}

*/

describe("map/fn#", function() {

  /**
   */

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

  /**
   */

  it("can map an undefined value (default)", function() {
    var m = linen.schema({
      name: {
        $type: "string",
        $map: function(value) {
          if(value == undefined) return "NO BUENO";
          return value;
        }
      }
    }).model();

    expect(m.get("name")).to.be("NO BUENO");
  });

  /**
   */

  it("can setup a map on the root field", function() {
    var m = linen.schema({
      $map: function() {
        return {
          name: "craig"
        }
      }
    }).model();

    expect(m.get("name")).to.be("craig");
  });
})