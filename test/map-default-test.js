var linen = require(".."),
Model  = linen.Model,
expect = require("expect.js"),
type = require("type-component");

describe("map default values", function() {

  it("work with numbers", function() {

    var b = linen.schema({
      age: {
        $type: "number",
        $default: 0
      }
    }).model();


    expect(b.get("age")).to.be(0);
  });

  it("work woth boolean values", function() {
    var b = linen.schema({
      hasFriends: {
        $type: "boolean",
        $default: false
      }
    }).model();

    expect(b.get("hasFriends")).to.be(false);
  });

  it("work with functions", function() {
    var b = linen.schema({
      name: {
        $type: "string",
        $default: function() {
          return "jake";
        }
      }
    }).model();
    
    expect(b.get("name")).to.be("jake");
  });


  it("works with nested fields", function() {
    var s = linen.schema({
      address: {
        city: {
          $type: "string",
          $default: "sf"
        }
      }
    }), b = s.model();

    expect(b.get("address.city")).to.be("sf");
  });

  it("fills nested objects without explicit $default", function() {
    var s = linen.schema({
      address: {
        city: {
          name: "string"
        }
      }
    }), b = s.model();

    expect(b.get("address")).not.to.be(undefined)
    expect(b.get("address.city")).not.to.be(undefined)
    expect(b.get("address.city.name")).to.be(undefined)
  });


  it("works with dates", function() {
    
    var b = linen.schema({
      createdAt: {
        $type: "number",
        $default: Date.now
      }
    }).model();

    var now = Date.now();
    expect(type(b.get("createdAt"))).to.be("number");
  });

  it("can fetch all default fields in a model", function() {
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

    expect(type(b.get("createdAt"))).to.be("number");
    expect(b.get("age")).to.be(23);
    expect(b.get("name")).to.be("craig");
    expect(b.get("address.city")).to.be("sf");
    expect(b.get("address.state")).to.be("CA");

  });

  describe("with existing model", function() {

    it("doesn't define default value", function() {

      var b = linen.schema({
        name: "string",
        age: {
          $default: 0
        }
      }).model("abba");


      expect(b.get("age")).to.be(undefined);

    });
  });
});