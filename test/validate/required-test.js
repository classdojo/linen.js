var linen = require("../.."),
expect = require("expect.js");

describe("validate/type#", function() {

  var s = linen.schema({
    name: {
      $type: "string",
      $required: true
    },
    age: {
      $required: true
    }
  });

  it("fails if the value doesn't exist", function(next) {
    s.model().validate(function(err) {
      expect(!!err).to.be(true);
      next();
    })
  });

  it("doesn't break if the value is 0", function(next) {
    s.model({name:"STR",age:0}).validate(next);
  });
  it("doesn't break if the value is false", function(next) {
    s.model({name:"AGG",age:false}).validate(next);
  });

})