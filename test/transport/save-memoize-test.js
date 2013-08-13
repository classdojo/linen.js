var linen = require("../.."),
expect    = require("expect.js");

describe("transport/save memoize#", function() {

  var s = linen.schema({
    name: "string",
    $request: {
      post: function(payload, next) {
        payload.model.set("posted", true);
        next(null, { _id: "abba" });
      },
      put: function(payload, next) {
        payload.model.set("puted", true);
        next();
      }
    }
  });

  it("only sends changed data to the server", function(next) {

    var putCount = 0;

    var m = linen.schema({
      name: "string",
      age: "number",
      $request: {
        get: function(payload, next) {
          next(null, {
            age: 99
          })
        },
        put: function(payload, next) {  
          putCount++;
          expect(payload.data.name).to.be("abba");
          expect(Object.keys(payload.data).length).to.be(1);
          next(null, {
            name: "bdda"
          });
        }
      }
    }).model({ _id: "craig" });

    m.load(function() {
      //trigger change
      m.set("name", "abba");

      expect(m.get("age")).to.be(99);
      m.save(function() {
        expect(putCount).to.be(1);
        expect(m.get("name")).to.be("bdda");
        next();
      });
    });
  });

  it("doesn't send data that's not specified int the schema", function(next) {
    var putCount = 0;
    var m = linen.schema({
      name: "string",
      age: "number",
      $request: {
        put: function(payload, next) {  
          putCount++;
          expect(payload.data.blah).to.be(undefined);
          next();
        }
      }
    }).model({_id: "craig", blah: "fdsfds" });

    m.save(function() {
      expect(putCount).to.be(0);
      next();
    });
  });


  it("doesn't send data if a field is a reference", function(next) {
    var getCount = 0,
    putModelCount = 0,
    putCount = 0,
    l = linen();
    l.schema("person", {
      name: "string",
      changed: {
        $request: {
          put: function(payload, next) {
            putCount++;
            next();
          }
        }
      },
      address: {
        $ref: "address"
      },
      $request: {
        get: function(payload, next) {
          getCount++;
          next();
        },
        put: function(payload, next) {
          putModelCount++;
          next();
        }
      }
    });
    l.schema("address", {
      name: "string",
      address: {
        $ref: "address"
      },
      $request: {
        get: function(payload, next) {
          next();
        }
      }
    });

    var m = l.model("person", { _id: "adda", address: "abba" });

    m.load(function() {
      expect(getCount).to.be(1);
      m.set("changed", true);
      m.save(function() {
        expect(putCount).to.be(1);
        expect(putModelCount).to.be(0);
        next();
      });

    })
  });
})