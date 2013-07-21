var api = require("./api"),
expect = require("expect.js");

describe("basic", function() {

  it("throws an error if a model doesn't exist", function() {
    var err;
    
    try {
      api.model("doesn't exist");
    } catch(e) {
      err = e;
    }

    expect(err.message).to.contain("exist");
  });

})