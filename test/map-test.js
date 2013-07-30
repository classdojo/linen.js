var linen = require(".."),
Model  = linen.Model,
expect = require("expect.js");

describe("mapping", function() {


  describe("default values", function() {
    it("works with numbers", function() {

      var s = linen.schema({
        age: {
          $type: "number",
          $default: 0
        }
      }), b = new linen.Model(s);

      expect(b.get("age")).to.be(0);
    });
  })
});