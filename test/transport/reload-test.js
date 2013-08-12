var linen = require("../.."),
expect    = require("expect.js");


describe("transport/reload#", function() {
  it("can reload a model", function(next) {
    var loadCount = 0;
    var m = linen.schema({
      name: "string",
      $request: {
        get: function(payload, next) {
          loadCount++;
          next(null, {
            name: "craig"
          })
        }
      }
    }).model();

    m.reload(function() {
      m.reload(function() {
        m.reload(function() { 
          expect(loadCount).to.be(3);
          next();
        })
      })
    })
  });
})