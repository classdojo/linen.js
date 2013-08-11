var linen = require("../.."),
expect    = require("expect.js");

/*

field: {
  $request: 
    get: (payload, next) ->
}

*/


describe("transport/get simple#", function() {

  var s = linen.schema({
    name: "string",
    address: {
      city: "string",
      state: "string"
    },
    requestCount: {
      $default: 0
    },
    $request: {
      get: function(payload, next) {
        payload.model.set("requestCount", payload.model.get("requestCount") + 1);
        next(null, {
          name: "Craig",
          address: {
            city: "San Francisco",
            state: "CA"
          }
        })
      }
    }
  });


  it("can request data", function(next) {

    var m = s.model();

    m.load(function() {
      expect(m.get("name")).to.be("Craig");
      expect(m.get("address.city")).to.be("San Francisco");
      expect(m.get("address.state")).to.be("CA");
      next();
    });
  });

  it("cannot reload a model", function(next) {
    var m = s.model();
    m.load(function() {
      m.load(function() {
        expect(m.get("requestCount")).to.be(1);
        next();
      })
    })
  });

  describe("loads a model when", function() {

    it("binding to a shallow property", function(next) {
      var m;
      (m = s.model()).bind("name").to(function() {
        expect(m.get("name")).to.be("Craig");
        next();
      }).now();
    });

    it("binding to a deep property", function(next) {
      var m;
      (m = s.model()).bind("address").to(function(address) {
        expect(m.get("address")).to.be(address);
        expect(m.get("address.city")).to.be("San Francisco");
        expect(m.get("name")).to.be("Craig");
        next();
      }).now();
    });

    it("binding to a property of a field", function(next) {
      var m;
      (m = s.model()).bind("name.length").to(function(len) {
        expect(m.get("name")).to.be("Craig");
        expect(m.get("name").length).to.be(len);
        next();
      }).now();
    });
  });


  describe("doesn't load when", function() {

    it("a shallow property exists", function(next) {
      var m;
      (m = s.model({name:"abba"})).bind("name").to(function() {
        expect(m.get("name")).to.be("abba");
        next();
      }).now();
    });

    it("a virtual property exists", function(next) {
      var m;
      (m = s.model({last:"abba"})).bind("last").to(function() {
        expect(m.get("last")).to.be("abba");
        next();
      }).now();
    })
  })
});
