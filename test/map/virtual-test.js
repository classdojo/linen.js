var linen = require("../.."),
expect = require("expect.js");

describe("map/virtual#", function() {

  var s = linen.schema({
    firstName: "string",
    lastName: "string",
    fullName: {
      $type: "string",
      $get: function() {
        return [this.get("firstName"), this.get("lastName")].join(" ");
      },
      $set: function() {
        var nameParts = String(this.get("fullName") || "").split(" ");
        this.set("firstName", nameParts.shift());
        this.set("lastName", nameParts.join(" "));
      },
      $bind: ["firstName", "lastName"]
    }
  });

  /*it("can bind two properties together", function(next) {
    var m = s.model({ firstName: "Craig", lastName: "Condon" })
    setTimeout(function() {
      console.log(m.data)
      next();
    }, 2);

  })*/
});