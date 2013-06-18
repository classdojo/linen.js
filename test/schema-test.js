var linen = require("..")(),
mocha = require("mocha"),
expect = require("expect.js");


describe("schema", function() {

    var addressSchema = linen.addSchema({
      name: "address",
      fields: {
        city  : "string",
        state : { $is: /^\w{2}$/ },
        zip   : { 
          $type: "string", 
          $test: function(v) {
            return String(v) != "99999";
          }
        }
      }
    });

    var personSchema = linen.addSchema({
      name: "person",
      fields: {
        name: "string",
        address: { $ref: "address" }
      }
    }),
    personModel,
    addressModel;


    it("a new model is new", function() {
      personModel = personSchema.model();
      expect(personModel.isNew()).to.be(true);
    });


    it("has an address model", function() {
      expect(personModel.get("address").schema.name).to.be("address");
    });


    it("throws an error if address is the wrong type", function() {
      var address = personModel.get("address");
      personModel.set("address", 4);
      expect(personModel.validate().message).to.contain("must be type address");
      personModel.set("address", address);
    });


    it("throws an error if address value is invalid", function() {
      personModel.set("address.zip", "99999");
      expect(personModel.validate().message).to.contain("is invalid");
      personModel.set("address.zip", "99991");
      expect(personModel.validate()).to.be(undefined);
    });

    it("can persist the address when it changes", function() {
      personModel.set("name", "jake");
      expect(Object.keys(personModel._changed)).to.contain("name");
      personModel.save(); 
      expect(Object.keys(personModel._changed).length).to.be(0);
    });


    it("throws an error if the city is incorrect", function() {
      personModel.set("address.state", "MNS");
      expect(personModel.validate()).not.to.be(undefined);
      personModel.set("address.state", "MN");
      expect(personModel.validate()).to.be(undefined);
    })

})
