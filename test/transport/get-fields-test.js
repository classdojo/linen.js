var linen = require("../.."),
expect    = require("expect.js");

/*

field: {
  $request: 
    get: (payload, next) ->
}

*/


describe("transport/get field#", function() {


  var s = linen.schema({
    name: "string",
    last: {
      $request: {
        get: function(payload, next) {
          next(null, "abba");
        }
      }
    },
    counts:{
      address: {
        $default: 0
      },
      model: {
        $default: 0
      }
    },
    address: {
      city: "string",
      state: "string",
      $request: {
        get: function(payload, next) {
          payload.model.set("counts.address", payload.model.get("counts.address") + 1);
          next(null, {
            city: "San Francisco",
            state: "CA"
          })
        }
      }
    },
    $request: function(payload, next) {
      payload.model.set("counts.address", payload.model.get("counts.address") + 1);
      next(null, {
        name: "craig"
      })
    }
  });

  /**
   */

  it("can fetch an individual field without loading others", function(next) {
    var m = s.model();
    m.bind("address").to(function(v) {
      expect(m.get("address.city")).to.be("San Francisco");
      expect(m.get("counts.address")).to.be(1);
      expect(m.get("name")).to.be(undefined);
      next();
    }).now();
  });

  /**
   */

  it("can fetch a remote, simple data type", function(next) {
    var m = s.model();
    m.bind("last").to(function(v) {
      expect(m.get("name")).to.be(undefined);
      expect(m.get("last")).to.be("abba");
      next();
    }).now();
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
  });

});