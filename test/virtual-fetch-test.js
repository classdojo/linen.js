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


  it("can fetch individual fields", function(next) {
    var b = linen.schema({
      name: "string",
      $fetch: function(next) {
        next(null, {
          name: "craig"
        });
      } 
    }).model("abba");

    b.fetchField("name", function() {
      expect(b.get("name")).to.be("craig");
      next();
    })
  });

  //make sure we don't run needless fetches
  describe("memoization", function() {

    it("doesn't call .fetch() more than once", function(next) {
      var fetchCount = 0;

      var b = linen.schema({
        name: "string",
        age: "number",
        $fetch: function(next) {
          fetchCount++;
          next(null, {
            name: "craig",
            age: 99
          });
        }
      }).model("abba");

      b.fetchAll(function() {
        expect(fetchCount).to.be(1);
        next();
      })
    })

    
  })
});