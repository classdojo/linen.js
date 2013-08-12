var linen = require("../.."),
expect = require("expect.js");

describe("map/cast#", function() {

  var s = linen.schema({
    "bool": "boolean",
    "str": "string",
    "num": "number"
  });

  it("can cast to a boolean value", function() {
    expect(s.model({"bool":0}).get("bool")).to.be(false)
    expect(s.model({"bool":"false"}).get("bool")).to.be(true)
    expect(s.model({"bool":-1}).get("bool")).to.be(true)
    expect(s.model({"bool":undefined}).get("bool")).to.be(undefined)
  });

  it("can cast to a number value", function() {
    expect(s.model({"num":0}).get("num")).to.be(0)
    expect(s.model({"num":false}).get("num")).to.be(0)
    expect(isNaN(s.model({"num":"false"}).get("num"))).to.be(true);
    expect(s.model({"num":-1}).get("num")).to.be(-1)
  });

  it("can cast to a string value", function() {
    expect(s.model({"str":0}).get("str")).to.be("0")
  });
})