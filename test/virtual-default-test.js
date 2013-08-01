var linen = require(".."),
Model  = linen.Model,
expect = require("expect.js");

describe("virtual default values", function() {

  it("work with numbers", function() {

    var s = linen.schema({
      age: {
        $type: "number",
        $default: 0
      }
    }), b = new linen.Model(s);

    expect(b.get("age")).to.be(0);
  });

  it("work woth boolean values", function() {
    var s = linen.schema({
      hasFriends: {
        $type: "boolean",
        $default: false
      }
    }), b = new linen.Model(s);

    expect(b.get("hasFriends")).to.be(false);
  });

  it("work with functions", function() {
    var s = linen.schema({

    });
  });

  it("works asynchronously", function() {

  });

  it("works with data-bindings", function(next) {
    var s = linen.schema({
      age: {
        $type: "number",
        $default: 0
      }
    }), b = new linen.Model(s);

    b.bind("age").to(function(v) {
      expect(v).to.be(0);
      next();
    }).now();
  });


  it("works with nested fields", function(next) {
    var s = linen.schema({
      address: {
        city: {
          $type: "string",
          $default: "sf"
        }
      }
    }), b = new linen.Model(s), b2 = new linen.Model(s);

    expect(b.get("address.city")).to.be("sf");
    b2.bind("address.city").to(function(v) {
      expect(v).to.be("sf");
      next();
    }).now();
  });


  it("works with functions", function() {
    var s = linen.schema({
      name: {
        $type: "string",
        $default: function() {
          return "craig";
        }
      }
    });
  });
});