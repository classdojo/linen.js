var linen = require(".."),
expect    = require("expect.js");

describe("fetch", function() {
  describe("GET", function() {

    /*it("works with new models, but doesn't do anything", function(next) {
      var m = linen.schema({
        name: "string",
        $fetch: {
          get: function(payload, next) {
            next();
          }
        }
      }).model();

      m.load(function(err) {
        expect(err).to.be(undefined)
        next();
      })
    });

    it("works when explicitly called", function(next) {
      var p = linen.schema({
        name: "string",
        $fetch: {
          get: function(payload, next) {
            expect(payload.model.get("_id")).to.be("abba")
            next(null, {
              name: "craig"
            })
          }
        }
      }), m = p.model("abba");

      m.load(function() {
        expect(m.get("name")).to.be("craig");
        next()
      });
    });

    it("works with nested fields", function(next) {
      var m = linen.schema({
        name: {
          $type: "string",
          $fetch: {
            get: function(payload, next) {
              next(null, "craig")
            }
          }
        }
      }).model();

      m.load(function() {
        expect(m.get("name")).to.be(undefined);
        m.loadField("name", function() {
          expect(m.get("name")).to.be("craig");
          next();
        })
      });
    });*/

    it("works by binding to a property", function(next) {
      var s = linen.schema({
        name: {
          $type: "string",
          $fetch: {
            get: function(payload, next) {
              next(null, "john");
            }
          }
        }
      });

      s.model().bind("name", function(value) {
        expect(value).to.be("john");
        next();
      });
    });

    it("errors if GET doesn't exist", function(next) {
      var s = linen.schema({
        name: {
          $type: "string",
          $fetch: {
          }
        }
      });

      s.model().loadField("name", function(err) {
        expect(err.message).to.be('method "get" doesn\'t exist')
        next();
      })
    });
  })
})