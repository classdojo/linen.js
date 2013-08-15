var linen = require("../.."),
expect = require("expect.js");

describe("validate/type#", function() {

  var s = linen.schema({
    name: "string",
    age: "number"
  });

  describe("strings", function() {

    it("works with regular strings", function(next) {
      s.model({name:"craig"}).validate(next);
    });

    it("fails on numbers", function(next) {
      var m = s.model();
      m.set("name", 0);
      m.validate(function(err) {
        expect(!!err).to.be(true);
        next();
      });
    });


    //screws up cases such as first_name="blah", last_name=""
    it("succeeds if the string length is 0", function(next) {
      s.model({name:""}).validate(function(err) {
        expect(!!err).to.be(false);
        next();
      });
    })

    it("works with undefined", function(next) {
      var m = s.model();
      m.set("name", undefined);
      m.validate(next);
    })
  });


  describe("numbers", function() {
    it("works with regular numbers", function(next) {
      s.model({age:0}).validate(next);
    });
    it("fails on NaNs", function(next) {
      s.model({age:NaN}).validate(function(err) {
        expect(!!err).to.be(true);
        next();
      });
    });
  });

})