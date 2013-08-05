var linen = require(".."),
expect    = require("expect.js");

describe("save", function() {
  describe("new", function() {

    
    it("can properly save a new item", function(next) {
      var hitSaveCount = 0;
      var s = linen.schema({
        name: "string",
        $fetch: {
          post: function(payload, next) {
            hitSaveCount++;
            expect(payload.body.name).to.be("craig");
            next();
          }
        }
      });

      s.model({ name: "craig" }).save(function() {
        expect(hitSaveCount).to.be(1);
        next();
      });
    }); 

    it("can properly save a default item", function(next) {
      var hitSaveCount = 0;
      var s = linen.schema({
        name: "string",
        age: {
          $type: "number",
          $default: 99
        },
        $fetch: {
          post: function(payload, next) {
            hitSaveCount++;
            expect(payload.body.age).to.be(99);
            next();
          }
        }
      });

      s.model({ name: "craig" }).save(function() {
        expect(hitSaveCount).to.be(1);
        next();
      });
    });

    it("can propertly save a nested field", function(next) {

      var saveCount = 0;
      var s = linen.schema({
        name: "string",
        address: {
          city: "string",
          $fetch: {
            post: function(payload, next) {
              saveCount++;
              expect(payload.body.address.city).to.be("SF");
              expect(payload.currentData.city).to.be("SF");
              next(null, {
                city: "SF2"
              });
            }
          }
        }
      }), m;


      (m = s.model({ address: { city: "SF"}})).save(function() {
        expect(saveCount).to.be(1);
        expect(m.get("address.city")).to.be("SF2");
        next();
      });
    });


    it("can properly save a deeply nested field", function(next) {
      var saveCount = 0,
      s = linen.schema({
        a: {
          b: {
            c: {
              $fetch: {
                post: function(payload, next) {
                  saveCount++;
                  expect(payload.body.a.b.c).to.be("ABBA");
                  expect(payload.currentData).to.be("ABBA");
                  next(null, "blah");
                }
              }
            }
          }
        }
      }), m;

      (m = s.model({a:{b:{c:"ABBA"}}})).save(function() {
        expect(saveCount).to.be(1);
        expect(m.get("a.b.c")).to.be("blah");
        next();
      })
    });

    it("can save a model multiple times", function(next) {

      var saveCount = 0,
      s = linen.schema({
        name: "string",
        $fetch: {
          post: function(payload, next) {
            saveCount++;
            if(saveCount == 1) {
              expect(payload.currentData.name).to.be("craig");
            } else {
              expect(payload.currentData.name).to.be("john");
            }
            next()
          }
        }
      }), m = s.model();

      m.set("name", "craig");
      m.save(function() {
        m.set("name", "john");
        m.save(function() {
          expect(saveCount).to.be(2);
          next();
        })
      });
    });

    it("cannot save if a value hasn't changed", function(next) {

      var saveCount = 0,
      s = linen.schema({
        name: "string",
        $fetch: {
          post: function(payload, next) {
            saveCount++;
            next();
          }
        }
      }), m = s.model();

      m.save(function() {
        m.save(function() {
          expect(saveCount).to.be(1);
          next();
        }); 
      })
    });


    it("posts, then puts", function(next) {
      var postCount = 0,
      putCount = 0,
      s = linen.schema({
        name: "string",
        $fetch: {
          post: function(payload, next) {
            postCount++;
            next(null, {
              _id: "abba"
            });
          },
          put: function(payload, next) {
            putCount++;
            next(null);
          }
        }
      }), m = s.model();

      m.save(function() {
        m.save(function() {
          expect(putCount).to.be(1);
          expect(postCount).to.be(1);
          next();
        }); 
      })
    });

    it("doesn't resave if the server response is different", function() {
      var putCount = 0,
      s = linen.schema({
        name: "string",
        randomValue: "number",
        $fetch: {
          put: function(payload, next) {
            putCount++;
            next(null, {
              randomValue: Math.random()
            });
          }
        }
      }), m = s.model("abba");

      m.save(function() {
        m.save(function() {
          m.save(function() {
            expect(putCount).to.be(1);
          })
        })
      })
    });
  });

  describe("existing", function() {

  })
});