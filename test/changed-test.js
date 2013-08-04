var linen = require(".."),
expect    = require("expect.js");

describe("model", function() {


  it("stores changed values", function() {
    var m = linen.schema({
      name: "string"
    }).model();

    m.set("name", "craig");

    expect(m._changes.name).to.be(1);
  });


  it("stores changes on any value", function() {
    var m = linen.schema({
    }).model();

    m.set("name", "craig");
    expect(m._changes.name).to.be(1);
  });

  it("can flush changes", function(){
    var m = linen.schema({
    }).model();

    m.set("name", "abba");
    m.set("last", "abba");
    expect(m._changes.name).to.be(1);
    expect(m._changes.last).to.be(1);

    m._flushChanges()
    expect(m._changes.name).to.be(undefined);
    expect(m._changes.last).to.be(undefined);
  });
})