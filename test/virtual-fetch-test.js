var linen = require(".."),
Model  = linen.Model,
expect = require("expect.js"),
type = require("type-component");

describe("virtual fetch", function() {

  it("doesn't work if there isn't an id", function(next) {
    var b = linen.schema({
      name: "string",
      $fetch: function(next) {
        next(null, {
          name: "craig"
        });
      }
    }).model();


    b.fetchAll(function() {
      expect(b.get("name")).to.be(undefined);
      next();
    });

  });

  it("works if there is an id", function(next) {
    var b = linen.schema({
      name: "string",
      $fetch: function(next) {
        next(null, {
          name: "craig"
        });
      } 
    }).model("abba");

    b.fetchAll(function() {
      expect(b.get("name")).to.be("craig");
      next();
    });
  });
});