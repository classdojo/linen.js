var linen = require(".."),
expect    = require("expect.js");

describe("references", function() {
  it("can be loaded", function(next) {
    var count = 0,
    putCount = 0,
    l = linen();

    l.schema("person", {
      name: "string",
      address: {
        $ref: "address"
      }
    });

    l.schema("address", {
      name: "string",
      state: "string",
      $fetch: {
        get: function(payload, next) {
          expect(payload.model.owner.get("name")).to.be("craig");
          next(null, {
            name: "sf",
            state: "ca"
          })
        },
        put: function(payload, next) {
          putCount++;
          expect(payload.currentData.name).to.be("mn");
          next();
        }
      }
    });


    var m = l.model("person", { name: "craig", address: "abba" }),
    address = m.get("address");

    m.loadAllFields(function() {
      expect(address).to.be(m.get("address"));
      address.set("name", "mn");
      m.save(function() {
        expect(putCount).to.be(1);
        next();
      })
    });
  });

})