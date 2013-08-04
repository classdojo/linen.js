var linen = require(".."),
expect = require("expect.js");

describe("map references", function() {


  it("works with models", function() {

    var l = linen(),
    p = l.schema("person", {
      name: "string",
      address: {
        $ref: "address"
      }
    }),
    h = l.schema("address", {
      city: "string",
      state: "string"
    }),
    m = p.model({ address: "abba" });
    expect(m.get("address").schema.name).to.be("address");

  });


  it("can use references recursively", function() {
    var l = linen(),
    p = l.schema("person", {
      name: "string",
      friend: {
        $ref: "person"
      }
    }),
    m = p.model(),
    m2 = p.model({ friend: "abba" });

    expect(m.get("friend")).to.be(undefined);
    expect(m2.get("friend._id")).to.be("abba");
  });


  it("properly sets the owner of a particular model", function() {
    var l = linen(),
    p = l.schema("person", {
      name: "string",
      address: {
        $ref: "address"
      }
    }),
    h = l.schema("address", {
      city: "string",
      state: "string"
    }),
    m = p.model({ address: "abba" });
    expect(m.get("address").owner).to.be(m);
  });

  it("properly maps a defined reference", function() {
    var l = linen(),
    p = l.schema("person", {
      name: "string",
      address: {
        $ref: "address"
      }
    }),
    h = l.schema("address", {
      city: "string",
      state: "string"
    }),
    m = p.model({ name: "craig", address: { city: "SF", state: "CA"} });
    expect(m.get("address.city")).to.be("SF");
    expect(m.get("address.state")).to.be("CA");
    expect(m.get("name")).to.be("craig");
  })

});