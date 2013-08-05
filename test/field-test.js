var linen = require(".."),
expect = require("expect.js")

describe("fields", function() {
  it("can fetch any field in a schema", function() {
    var s = linen.schema({
      name: "string",
      address: {
        city: "string",
        state: "string"
      }
    });

    expect(s.getField("name").path).to.be("name");
    expect(s.getField("address.city").path).to.be("address.city");
  });


  it("can fetch the closest field", function() {
    var s = linen.schema({
      name: "string",
      address: {
        city: "string",
        state: "string"
      }
    });

    expect(s.getField("address").path).to.be("address");
    expect(s.getField("address.city.length")).to.be(undefined);
    expect(s.getField("address.city.length", true).path).to.be("address.city");
    expect(s.getField("address.city.length.a.gg.f.f.f.d", true).path).to.be("address.city");
  });


  it("can fetch multiple fields", function() {
    var s = linen.schema({
      name: "string",
      address: {
        city: "string",
        state: "string"
      }
    });
 
    expect(s.getFields(["name", "address"]).length).to.be(2);
    expect(s.getFields(["name", "address", "address"]).length).to.be(2);
    expect(s.getFields(["name", "address", "address.city"]).length).to.be(3);
    expect(s.getFields(["name", "address", "address.length"]).length).to.be(2);
    expect(s.getFields(["name", "address", "address.length"], true).length).to.be(2);
    expect(s.getFields(["name", "address.length"], true).length).to.be(2);
  });
});