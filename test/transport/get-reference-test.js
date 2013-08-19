var linen = require("../.."),
expect    = require("expect.js");

describe("transport/get reference#", function() {
  var l = linen();
  l.schema("person", {
    name: "string",
    hobby: {
      $ref: "hobby"
    },
    friends: [{
      $ref: "person",
      $request: {
        get: function(payload, next) {
          next(null, [{
            name: "jake"
          }])
        }
      }
    }],
    $request: {
      get: function(payload, next) {
        next(null, {
          name: "craig",
          hobby: "cooking"
        })
      }
    }
  });

  l.schema("hobby", {
    name: "string",
    desc: "string",
    $request: {
      get: function(payload, next) {
        next(null, {
          name: "cooking!",
          desc: "make food with ingredients"
        })
      }
    }
  });

  it("doesn't GET reference if no sub property is bound", function(next) {
    var m;
    (m = l.model("person","abba")).bind("hobby").to(function() {
      expect(m.get("hobby._id")).to.be("cooking")
      expect(m.get("hobby.name")).to.be(undefined)
      next();
    }).now();
  });

  it("GETs a reference if a sub property is bound", function(next) {
    var m;
    (m = l.model("person","abba")).bind("hobby.name").to(function() {
      expect(m.get("hobby.name")).to.be("cooking!")
      next();
    }).now();
  });

  it("GETS a reference when it already exists in a model", function(next) {
    var m = l.model("person", { _id: "abba" });
    m.bind("friends").to(function() {
    });

    setTimeout(function() {
      expect(m.get("friends").length()).to.be(1);
      next();
    }, 20)
  })
});