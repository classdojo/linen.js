var linen = require("../.."),
expect    = require("expect.js");

describe("transport/save memoize#", function() {

  var s = linen.schema({
    name: "string",
    $request: {
      post: function(payload, next) {
        payload.model.set("posted", true);
        next(null, { _id: "abba" });
      },
      put: function(payload, next) {
        payload.model.set("puted", true);
        next();
      }
    }
  });

  it("only sends changed data to the server", function(next) {

    var m = linen.schema({
      name: "string",
      $request: {
        put: function(payload, next) {  
          expect(payload.data.name).to.be("abba");
          expect(Object.keys(payload.data).length).to.be(1);
          next();
        }
      }
    }).model({_id: "craig", name: "abba" });

    m.save(function() {

      next();
    });
  });

  it("doesn't send data that's not specified int he schema", function() {});
})