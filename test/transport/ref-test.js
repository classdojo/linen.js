var linen = require("../.."),
expect = require("expect.js");

describe("transport/ref#", function() {

  var l = linen();

  l.schema("person", {
    name: "string",
    address: {
      $ref: "address"
    }
  });
  l.schema("address", {
    name: "string",
    $request: {
      get: function(payload, next) {
        next(null, {
          name: "abba"
        })
      }
    }
  });


  it("can fetch an address", function(next) {
    l.model("person", { name: "baab", address: "somewhere" }).bind("address.name").to(function(name) {
      expect(name).to.be("abba");
      next();
    }).now();
  })
});