var linen = require(".."),
Model  = linen.Model,
expect = require("expect.js"),
type = require("type-component");

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

  it("works with nested fields", function(next) {
    var s = linen.schema({
      address: {
        city: {
          $type: "string",
          $default: "sf"
        }
      }
    }), b = new s.model(), b2 = s.model();

    expect(b.get("address.city")).to.be(undefined);
    b2.bind("address.city").to(function(v) {
      expect(v).to.be("sf");
      next();
    }).now();
  });


  it("works with dates", function(next) {
    
    var b = linen.schema({
      createdAt: {
        $type: "number",
        $default: Date.now
      }
    }).model();

    var now = Date.now();

    b.bind("createdAt").to(function(v) {
      expect(type(v)).to.be("number");
      next();
    }).now();
  });

  it("can fetch all default fields in a model", function(next) {
    var b = linen.schema({
      createdAt: {
        $type: "number",
        $default: Date.now
      },
      age: {
        $type: "number",
        $default: 23
      },
      name: {
        $type: "string",
        $default: "craig"
      },
      address: {
        city: {
          $type: "string",
          $default: "sf"
        },
        state: {
          $type: "string",
          $default: "CA"
        }
      }
    }).model();

    b.fetchAll(function() {
      expect(type(b.get("createdAt"))).to.be("number");
      expect(b.get("age")).to.be(23);
      expect(b.get("name")).to.be("craig");
      expect(b.get("address.city")).to.be("sf");
      expect(b.get("address.state")).to.be("CA");
      next();
    });
  });

  describe("with existing model", function() {

    it("don't define default value", function(next) {

      var b = linen.schema({
        name: "string",
        age: {
          $default: 0
        }
      }).model("abba");

      b.fetchAll(function() {
        expect(b.get("age")).to.be(undefined);
        next();
      });
    });
  });
});