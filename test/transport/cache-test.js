var Cache = require("../../lib/field/controllers/transporter/cache"),
expect = require("expect.js");

describe("transport/cache#", function() {


  it("can store a string", function() {
    var cache = new Cache();
    cache.store("ab");
    expect(cache._data["ov"]).to.be("ab");
  });


  it("can pluck out new changes in a string", function() {
    var cache = new Cache();
    cache.store("ab");
    expect(cache.pluck("ab")).to.be(undefined);
    expect(cache.pluck("cd", true)).to.be("cd");
    expect(cache._data["ov"]).to.be("cd");
  });

  it("can store an object", function() {
    var cache = new Cache();
    cache.store({ name: "craig", last: "condon" });
    expect(cache._data["ov.oname"]).to.be("craig");
    expect(cache._data["ov.olast"]).to.be("condon");
  });

  it("can pluck changes out of an object", function() {
    var cache = new Cache();
    cache.store({ name: "craig", last: "condon" });

    var changed = cache.pluck({ name: "craig", last: "smith" });

    expect(changed.name).to.be(undefined);
    expect(changed.last).to.be("smith");
  });

  it("can pluck changes out of a deep object", function() {
    var cache = new Cache();
    cache.store({
      name: "craig",
      age: 99,
      address: {
        city: "San Francisco",
        state: "CA",
        country: {
          name: "USA"
        }
      }
    });

    var changed = cache.pluck({
      name: "craig",
      age: 99,
      address: {
        city: "San Jose",
        state: "CA",
        country: {
          name: "BAHH"
        }
      }
    });

    expect(changed.name).to.be(undefined);
    expect(changed.age).to.be(undefined);
    expect(changed.address.city).to.be("San Jose");
    expect(changed.address.state).to.be(undefined);
    expect(changed.address.country.name).to.be("BAHH");
  });


});