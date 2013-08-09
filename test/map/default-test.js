var linen = require("../../lib"),
expect    = require("expect.js"),
type      = require("type-component");


describe("map/default#", function() {

  var s = linen.schema({
    zeroValue: {
      $type: "string",
      $default: 0
    },
    dateValue: {
      $type: "date",
      $default: Date.now
    },
    trueValue: {
      $type: "boolean",
      $default: true
    },
    falseValue: {
      $type: "boolean",
      $default: false
    }
  })

  it("can map many different types of values", function() {
    var m = s.model();
    expect(m.get("zeroValue")).to.be(0);
    expect(type(m.get("dateValue"))).to.be("number");
    expect(m.get("trueValue")).to.be(true);
    expect(m.get("falseValue")).to.be(false);
  });
});