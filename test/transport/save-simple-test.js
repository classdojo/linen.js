var linen = require("../.."),
expect    = require("expect.js");

describe("transport/save simple#", function() {

  var s = linen.schema({
    name: "string",
    $request: {
      get: function(payload, next) {
        payload.model.set("getted", true);
        next();
      },
      post: function(payload, next) {
        payload.model.set("posted", true);
        next(null, { _id: "abba" });
      },
      put: function(payload, next) {
        payload.model.set("puted", true);
        next();
      }
    }
  });

  it("calls POST if the model is new", function(next) {
    var m = s.model();
    m.save(function() {
      expect(m.get("posted")).to.be(true);
      expect(m.get("_id")).to.be("abba");
      next()
    })
  });

  it("calls PUT when a model isn't new", function(next) {
    var m = s.model("aba");
    m.set("name", "bb");
    m.save(function() {
      expect(m.get("puted")).to.be(true);
      next()
    });
  });

  it("calls POST, then PUT after saving twice", function(next) {
    var m = s.model();
    m.save(function() {
      expect(m.get("posted")).to.be(true);
      expect(m.get("puted")).to.be(undefined);
      expect(m.get("_id")).to.be("abba");
      m.set("name", "dd");
      m.save(function() {
        expect(m.get("puted")).to.be(true);
        next()
      })
    });
  });


  it("doesn't save if there's nothing to save", function(next) {
    var m = s.model({_id:"abb"})
    m.save(function() {
      expect(m.get("puted")).to.be(undefined);
      next();
    })
  });


  it("emits save on save", function(next) {
    var m = s.model({});
    m.once("save", next);
    m.save(function(){})
  });

})