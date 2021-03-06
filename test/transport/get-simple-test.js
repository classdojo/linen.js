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

    var m = s.model({_id:"abba"});

    m.load(function() {
      expect(m.get("name")).to.be("Craig");
      expect(m.get("address.city")).to.be("San Francisco");
      expect(m.get("address.state")).to.be("CA");
      next();
    });
  });

  it("cannot reload a model", function(next) {
    var m = s.model({_id:"abba"});
    m.load(function() {
      m.load(function() {
        expect(m.get("requestCount")).to.be(1);
        next();
      })
    })
  });

  it("maintains a memo if the returned data is different", function(next) {
    var putCount = 0;
    var m = linen.schema({
      age: "number",
      $request: {
        put: function(payload, next) {
          putCount++;
          next(null, { age: String(payload.data.age) })
        }
      }
    }).model({_id: 'abba'});
    m.set("age", 0);
    m.save(function() {
      m.save(function() {
        expect(putCount).to.be(1);
        next();
      });
    })
  });

  describe("loads a model when", function() {

    it("binding to a shallow property", function(next) {
      var m;
      (m = s.model({_id:"abba"})).bind("name").to(function() {
        expect(m.get("name")).to.be("Craig");
        next();
      }).now();
    });

    it("binding to a deep property", function(next) {
      var m;
      (m = s.model({_id:"abba"})).bind("address").to(function(address) {
        expect(m.get("address")).to.be(address);
        expect(m.get("address.city")).to.be("San Francisco");
        expect(m.get("name")).to.be("Craig");
        next();
      }).now();
    });

    it("binding to a property of a field", function(next) {
      var m;
      (m = s.model({_id:"abba"})).bind("name.length").to(function(len) {
        expect(m.get("name")).to.be("Craig");
        expect(m.get("name").length).to.be(len);
        next();
      }).now();
    });
  });


  describe("doesn't load when", function() {
    it("a property doesn't exist", function(next) {
      var m = s.model({_id:"abba"});

      (m = s.model({_id:"abba"})).bind("blah.length").to(function(len) {
      }).now();

      setTimeout(function() {
        expect(m.get("name")).to.be(undefined);
        next();
      }, 20);
    });
  })

});
