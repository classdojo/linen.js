var linen = require(".."),
expect    = require("expect.js");

describe("explicit map", function() {
  it("works for a model", function() {
    var s = linen.schema({
      name: "string",
      $map: function(data) {
        return {
          name: data.name || "craig"
        }
      }
    });

    expect(s.model().get("name")).to.be("craig");
    expect(s.model({ name: "john" }).get("name")).to.be("john");
  });
});