var linen = require(".."),
Model  = linen.Model,
expect = require("expect.js");

describe("virtual default values", function() {

  it("work with numbers", function(next) {

    var b = linen.schema({
      age: {
        $type: "number",
        $default: 0
      }
    }).model();


    expect(b.get("age")).to.be(undefined);

    b.bind("age").once().to(function(v) {
      expect(v).to.be(0);
      next();
    }).now();
  });

  it("work woth boolean values", function(next) {
    var b = linen.schema({
      hasFriends: {
        $type: "boolean",
        $default: false
      }
    }).model();

    expect(b.get("hasFriends")).to.be(undefined);

    b.bind("hasFriends").once().to(function(v) {
      expect(v).to.be(false);
      next();
    }).now();
  });

  describe("work with functions", function() {

    it("asynchronously", function(next) {

      var b = linen.schema({
        name: {
          $type: "string",
          $default: function(next) {
            next(null, "craig");
          }
        }
      }).model();

      b.bind("name").once().to(function(v) {
        expect(v).to.be("craig");
        next();
      }).now();
    });

    it("synchronously", function(next) {
      var b = linen.schema({
        name: {
          $type: "string",
          $default: function() {
            return "jake";
          }
        }
      }).model();


      b.bind("name").once().to(function(v) {
        expect(v).to.be("jake");
        next();
      }).now();
    });
    
  });

  return;

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