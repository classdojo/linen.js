var linen = require("../../lib"),
expect    = require("expect.js"),
type      = require("type-component");


describe("map/test#", function() {

  var s = linen.schema({
    address: {
      city: "string",
      state: "string"
    }
  });

  it("doesn't set a field if it doesn't exist", function() {
    expect(s.model().get("address")).to.be(undefined);
  })
});