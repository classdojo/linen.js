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

      it("fetches a property once if the nested fields are fetched multiple times", function(next) {
        var loadCount = 0;

        var s = linen.schema({
          name: "string",
          address: {
            city: "string",
            state: "string"
          },
          $fetch: {
            get: function(payload, next) {
              loadCount++;
              next(null, {
                name: "craig",
                address: {
                  city: "San Francisco",
                  state: "CA"
                }
              })
            }
          }
        }), m = s.model();

        m.loadField("name", function() {
          m.loadField("address.city", function() {
            m.loadField("address.state", function() {
              expect(loadCount).to.be(1);
              expect(m.get("name")).to.be("craig");
              expect(m.get("address.city")).to.be("San Francisco");
              expect(m.get("address.state")).to.be("CA");
              next();
            });
          });
        })
      });

      
      it("can load, and map a response", function(next) {

        var count = 0;

        var s = linen.schema({
          name: "string",
          $fetch: {
            get: function(payload, next) {
              next();
            }
          },
          $map: function(data) {
            return {
              count: ++count
            }
          }
        }), m = s.model();

        expect(m.get("count")).to.be(1);
        m.load(function() {
          expect(m.get("count")).to.be(2);
          next();
        });
      });


      describe("can load all fields", function() {

        it("with simple fields", function(next) {
          var s = linen.schema({
            name: {
              $type: "string",
              $fetch: {
                get: function(payload, next) {
                  next(null, "craig");
                }
              }
            },
            address: {
              city: "string",
              state: "string",
              $fetch:  {
                get: function(payload, next) {
                  next(null, {
                    city: "sf",
                    state: "ca"
                  });
                } 
              }
            },
            age: "number",
            $fetch: {
              get: function(payload, next) {
                next(null, {
                  age: 99
                });
              }
            }
          })

          var m = s.model();

          m.loadAllFields(function() {
            expect(m.get("name")).to.be("craig");
            expect(m.get("age")).to.be(99);
            expect(m.get("address.city")).to.be("sf");
            expect(m.get("address.state")).to.be("ca");
            next();
          });
        });

        it("with references", function(next) {
          var l = linen();
          l.schema("person", {
            name: "string",
            address:{
              $ref: "address"
            },
            $fetch: {
              get: function(payload, next) {
                next(null, { name: "craig", address: "addr" });
              }
            }
          });
          l.schema("address", {
            city: {
              $ref: "city"
            },
            state: {
              $ref: "state"
            },
            $fetch: {
              get: function(payload, next) {
                next(null, { city: "sf", state: "ca" });
              }
            }
          });
          l.schema("city", {
            name: "string",
            $fetch: {
              get: function(payload, next) {
                next(null, { name: "sf" })
              }
            }
          });
          l.schema("state", {
            name: "string",
            $fetch: {
              get: function(payload, next) {
                next(null, { name: "ca" })
              }
            }
          });

          var m = l.model("person");

          m.loadAllFields(function() {
            expect(m.get("name")).to.be("craig");

            //this SHOULD be undefined since only the fields defined
            //in the schema should be loaded
            expect(m.get("address.city.name")).to.be(undefined);
            expect(m.get("address.city._id")).to.be("sf");
            expect(m.get("address.state.name")).to.be(undefined);
            expect(m.get("address.state._id")).to.be("ca");
            next();
          })
        })
      });
    });
    
  });
});