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

    var putCount = 0;

    var m = linen.schema({
      name: "string",
      age: "number",
      $request: {
        get: function(payload, next) {
          next(null, {
            age: 99
          })
        },
        put: function(payload, next) {  
          putCount++;
          expect(payload.data.name).to.be("abba");
          expect(Object.keys(payload.data).length).to.be(1);
          next(null, {
            name: "bdda"
          });
        }
      }
    }).model({_id: "craig", name: "abba" });

    m.load(function() {
      expect(m.get("age")).to.be(99);
      m.save(function() {
        expect(putCount).to.be(1);
        expect(m.get("name")).to.be("bdda");
        next();
      });
    });
  });

  it("doesn't send data that's not specified int the schema", function() {});
})