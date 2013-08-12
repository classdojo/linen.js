var linen = require("../.."),
expect = require("expect.js");

describe("map/simple collection#", function() {
  
  var s = linen.schema({
    tags: ["string"]
  });

  /**
   */

  it("creates a simple collection when a model is created", function() {
    expect(s.model().get("tags").__isCollection).to.be(true);
  });

  /**
   */

  it("wraps the source up in a collection", function() {
    var col = s.model({ tags: ["a", "b", "c"] }).get("tags");
    expect(col.at(0)).to.be("a");
    expect(col.at(1)).to.be("b");
    expect(col.at(2)).to.be("c");
  });

  /**
   */

  it("wraps an object around an array if it isn't one", function() {
    var col = s.model({ tags: "aa" }).get("tags");
    expect(col.at(0)).to.be("aa");
  });
});