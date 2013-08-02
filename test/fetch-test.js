var linen = require(".."),
expect    = require("expect.js");

describe("fetch", function() {
  return;
  describe("GET", function() {
    it("works when explicitly called", function(next) {
      var p = linen.schema({
        name: "string",
        $fetch: function(payload, next) {

        }
      }).m = p.model();

      m.fetch(function() {
        expect(m.get("name")).to.be("")
      });
    });

    it("works when binding to a property on a schema which isn't fetched", function() {

    })
  })
})