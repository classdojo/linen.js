var linen = require("../.."),
expect = require("expect.js");

describe("map/virtual#", function() {

  var s = linen.schema({
    firstName: "string",
    lastName: "string",
    fullName: {
      $type: "string",
      $get: function() {
        return [this.get("firstName"), this.get("lastName")].join(" ");
      },
      $set: function() {
        var nameParts = String(this.get("fullName") || "").split(" ");
        this.set("firstName", nameParts.shift());
        this.set("lastName", nameParts.join(" "));
      },
      $bind: ["firstName", "lastName"]
    }
  });

  it("can get a virtual field", function() {
    var m = s.model({ firstName: "Craig", lastName: "Condon" })
    expect(m.get("firstName")).to.be("Craig");
    expect(m.get("lastName")).to.be("Condon");
    expect(m.get("fullName")).to.be("Craig Condon");
  });

  it("can set a virtual field", function() {
    var m = s.model({ firstName: "Craig", lastName: "Condon" });
    m.set("fullName", "A B");
    expect(m.get("firstName")).to.be("A");
    expect(m.get("lastName")).to.be("B");
    expect(m.get("fullName")).to.be("A B");
  });

  it("listens when either bindings change", function() {
    var m = s.model({ firstName: "Craig", lastName: "Condon" });
    m.set("firstName", "AA");
    expect(m.get("fullName")).to.be("AA Condon");
    m.set("lastName", "BB");
    expect(m.get("fullName")).to.be("AA BB");
  })
});