var linen = require("../.."),
expect = require("expect.js");


//turns a model back into a vanilla object
describe("map/normalize#", function() {

  var l = linen();
  l.schema("person", {
    name: "string",
    friends: [{
      $ref: "person"
    }]
  });


  it("can normalize a collection", function() {
    var m = l.model("person", { name: "craig", friends: [{ name: "john" }]});
    expect(m.normalize().friends[0].name).to.be("john");
  });

});