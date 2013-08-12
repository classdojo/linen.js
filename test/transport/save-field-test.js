var linen = require("../.."),
expect    = require("expect.js");

describe("transport/save field#", function() {
  it("can PUT an individual field", function(next) {

    var m = linen.schema({
      name: "string",
      archived: {
        $request: {
          put: function(payload, next) {
            expect(payload.data).to.be(true);
            next()
          }
        }
      }
    }).model("abba");

    m.set("archived", true);
    m.save(next);

  });
});