var hashObject = require("../lib/utils/hashObject"),
expect = require("expect.js");

describe("object hasher", function() {
  it("can hash simple values", function() {
    expect(hashObject({a:1,b:1})).to.be("ov.oa:1:ov.ob:1")
  });

  it("can hash nested values", function() {
    expect(hashObject({a:{b:1},c:false})).to.be("ov.oa.ob:1:ov.oc:false")
  });
  it("can hash arrays", function() {
    expect(hashObject([1, 2, { a: 3}])).to.be("ov.a0:1:ov.a1:2:ov.a2.oa:3")
  });
  it("can hash a string", function() {
    expect(hashObject("string")).to.be("ov:string")
  })
})

