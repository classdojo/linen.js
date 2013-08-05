var linen = require(".."),
expect    = require("expect.js");

describe("JSON", function() {
  it("can convert a model to an object", function() {

    var s = linen.schema({
      name: "string",
      last: "string",
      address: {
        city: "string"
      }
    });

    var d = s.model({ name: "craig", last: "c", address: {city:"San Francisco"} }).toJSON();

    expect(d.name).to.be("craig")
    expect(d.last).to.be("c");
    expect(d.address.city).to.be("San Francisco");
    expect(Object.keys(d).length).to.be(3);
  });

  it("can convert a model to an object with default values", function() {
    var s = linen.schema({
      name: "craig",
      age: {
        $default: 99,
        $type: "number"
      }
    });

    var d = s.model({ name: "craig" }).toJSON();
    expect(d.age).to.be(99);
  });


  it("properly converts references", function() {
    var l = linen(),
    s = l.schema("person", {
      name: "string",
      address: {
        $ref: "address"
      }
    });

    l.schema("address", {
      city: "string",
      state: "string"
    });

    var d = l.model("person", { name: "craig", address: { city: "SF", state: "CA" }}).toJSON();


    expect(d.name).to.be("craig");
    expect(d.address.city).to.be("SF");
    expect(Object.keys(d).length).to.be(2);

  });

})