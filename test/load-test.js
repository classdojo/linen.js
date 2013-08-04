var linen = require(".."),
expect    = require("expect.js");

describe("fetch", function() {
  describe("GET", function() {

    it("works with new models, but doesn't do anything", function(next) {
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
    });

    it("works with deeply nested fields", function(next) {
      var s = linen.schema({
        address: {
          city: {
            name: "string",
            zip: "number",
            $fetch: {
              get: function(payload, next) {
                next(null, {
                  name: "San Francisco",
                  zip: 93111
                })
              }
            }
          }
        }
      }), m = s.model();

      m.load(function() {
        expect(m.get("address.city.name")).to.be(undefined);
        expect(m.get("address.city.zip")).to.be(undefined);

        m.loadField("address.city", function(err) {
          expect(err).to.be(undefined);
          expect(m.get("address.city.name")).to.be("San Francisco");
          next();
        });
      })
    });

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


    it("works by binding a field value", function(next) {
      var s = linen.schema({
        name: "string",
        $fetch: {
          get: function(payload, next) {
            next(null, {
              name: "craig"
            });
          }
        }
      });

      s.model().bind("name.length").to(function(value) {
        expect(value).to.be(5);
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
        expect(err.message).to.be('method "get" on "name" doesn\'t exist')
        next();
      })
    });

    describe("bubbling", function() {

      it("works with any property", function(next) {
        var s = linen.schema({
          name: "string",
          last: "string",
          address: {

          },
          $fetch: {
            get: function(payload, next) {
              next(null, {
                name: "craig",
                last: "c",
                address: {
                  city: "San Francisco"
                }
              });
            }
          }
        }), m = s.model(), m2 = s.model();

        m.loadField("name", function() {
          expect(m.get("name")).to.be("craig");
          expect(m.get("address.city")).to.be("San Francisco");

          //this doesn't actually exist.
          m2.bind("address.city", function() {
            expect(m2.get("name")).to.be("craig");
            expect(m2.get("address.city")).to.be("San Francisco");
            next();
          })
        });
      });

      it("works with nested properties", function(next) {
        var s = linen.schema({
          name: "string",
          address: {
            city: {
              $type: "string",
              $fetch: {
                get: function(payload, next) {
                  next(null, "San Francisco");
                }
              }
            },
            zip: "number",
            $fetch: {
              get: function(payload, next) {
                next(null, {
                  zip: 93111
                })
              }
            }
          }
        }), m = s.model(), m2 = s.model();

        m.loadField("address", function() {
          expect(m.get("address.zip")).to.be(93111);
          expect(m.get("address.city")).to.be(undefined);

          m.loadField("address.city", function() {
            expect(m.get("address.zip")).to.be(93111);
            expect(m.get("address.city")).to.be("San Francisco");
            next();
          });
        });
      });
    });

    describe("memoization", function() {

      it("loads a model once if a property is fetched multiple times", function(next) {

        var loadCount = 0;

        var s = linen.schema({
          name: "string",
          $fetch: {
            get: function(payload, next) {
              loadCount++;
              next(null, {
                name: "craig"
              })
            }
          }
        }), m = s.model();


        m.loadField("name", function() {
          expect(m.get("name")).to.be("craig");
          m.loadField("name", function() {
            expect(loadCount).to.be(1);
            expect(m.get("name")).to.be("craig");
            next();
          })
        });
      });


      it("properly re-fetches a model after the memo has expired", function(next) {
        var loadCount = 0;

        var s = linen.schema({
          name: "string",
          $memoize: {
            maxAge: 1
          },
          $fetch: {
            get: function(payload, next) {
              loadCount++;
              next(null, {
                name: "craig"
              });
            }
          }
        }),
        m = s.model();

        m.loadField("name", function() {
          expect(m.get("name")).to.be("craig");
          setTimeout(function() {
            m.loadField("name", function() {
              expect(m.get("name")).to.be("craig");
              expect(loadCount).to.be(2);
              next();
            })
          }, 10);
        })
      });
    });
    
  });
});