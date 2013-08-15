var linen = require("../.."),
expect = require("expect.js");


describe("transport/get memoize#", function() {
  

  it("can call request.get() as many times as necessary if no data is returned", function(next) {
    var getCount = 0;

    var m = linen.schema({
      name: "string",
      last: "string",
      $request: {
        get: function(payload, next) {
          getCount++;
          next();
        }
      }
    }).model();

    m.load(function() {
      m.load(function() {
        expect(getCount).to.be(2);
        next();
      })
    })
  })
})