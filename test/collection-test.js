var linen = require(".."),
expect    = require("expect.js");

describe("collections", function() {
  it("can be loadeded with simple data types", function(next) {

    var s = linen.schema({
      tags: [{
        $type: "string"
      }],
      $fetch: {
        get: function(payload, next) {
          next(null, {
            tags: ["a", "b", "c"]
          })
        }
      }
    }), m = s.model();

    m.load(function() {
      expect(m.get("tags").__collectionType).to.be("simple");
      expect(m.get("tags").at(0)).to.be("a");
      expect(m.get("tags").at(1)).to.be("b");
      expect(m.get("tags").at(2)).to.be("c");
      next();
    });
  });
})
