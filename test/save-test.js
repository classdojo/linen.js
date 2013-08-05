var linen = require(".."),
expect    = require("expect.js");

describe("save", function() {
  describe("new", function() {

    /*
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
    });*/

    it("can propertly save a nested field", function() {

      var saveCount = 0;
      var s = linen.schema({
        name: "string",
        address: {
          city: "string",
          $fetch: {
            post: function(payload, next) {
              saveCount++;
              expect(payload.data.address.city).to.be("SF");
              next();
            }
          }
        }
      });


      s.model({ address: { city: "SF"}}).save(function() {
        expect(saveCount).to.be(1);
        next();
      })
    })
  });

  describe("existing", function() {

  })
});