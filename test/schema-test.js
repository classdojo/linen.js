var linen = require("..")(),
mocha = require("mocha"),
expect = require("expect.js");


describe("schema", function() {

  return;

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
      name: {
        first: "string",
        last: "string"
      },
      address: { $ref: "address", $default: function() { 
        return this.linen.model("address");
      } },
      fullName: {
        $get: function(model) {
          return model.get("name.first") + " " + model.get("name.last");
        },
        $set: function(model, fullName) {
          var nameParts = String(fullName).split(" ");
          model.set("name.first", nameParts.shift());
          model.set("name.last", nameParts.shift());
        },
        $bind: ["name.first", "name.last"]
      },
      friends: [{ $ref: "person" }]
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




  it("throws an error if address value is invalid", function() {
    personModel.set("address.zip", "99999");
    expect(personModel.validate().message).to.contain("is invalid");
    personModel.set("address.zip", "99991");
    expect(personModel.validate()).to.be(undefined);
  });

  it("can persist the address when it changes", function() {
    personModel.set("name.first", "jake");
    expect(Object.keys(personModel._changed)).to.contain("name.first");
    personModel.save(); 
    expect(Object.keys(personModel._changed).length).to.be(0);
  });


  it("has use the virtual full name", function() {
    personModel.set("name.first", "john");
    personModel.set("name.last", "jeffery");
    expect(personModel.get("fullName")).to.be("john jeffery");
    personModel.set("name.last", "jake");
    expect(personModel.get("fullName")).to.be("john jake");
    personModel.set("fullName", "j j");
    personModel.set("name.first", "j");
    personModel.set("name.last", "j");
  })


  it("throws an error if the city is incorrect", function() {
    personModel.set("address.state", "MNS");
    expect(personModel.validate()).not.to.be(undefined);
    personModel.set("address.state", "MN");
    expect(personModel.validate()).to.be(undefined);
  })

})
