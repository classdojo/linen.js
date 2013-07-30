var linen = require(".."),
expect = require("expect.js"),
bindable = require("bindable");

describe("validate", function() {

  describe("strings", function() {

    var s = linen.schema({
      name: "string"
    }),
    s2 = linen.schema({
      name: {
        $type: "string",
        $required: true
      }
    })

    it("succeeds with the correct type", function(next) {
      s.validate(new bindable.Object({ name: "craig" }), next);
    }); 

    

    it("fails with the a number", function(next) {
      s.validate(new bindable.Object({name: 15 }), function(err) {
        expect(err.message).to.be("'name' must be a string");
        next();
      });
    });

    it("fails with an object", function(next) {
      s.validate(new bindable.Object({name: {} }), function(err) {
        expect(err.message).to.be("'name' must be a string");
        next();
      });
    });

    it("succeeds if name is not required and undefined", function() {
      s.validate(new bindable.Object({ name: undefined}), function(err) {
        expect(err).to.be(null);
      });
    });

    it("fails if name is required and undefined", function(next) {
      s2.validate(new bindable.Object({ name: undefined}), function(err) {
        expect(err.message).to.be("'name' must be defined");
        next();
      });
    });
  });

  describe("numbers", function() {

    var s = linen.schema({
      age: "number"
    }),
    s2 = linen.schema({
      age: {
        $type: "number",
        $required: true
      }
    });

    it("fail if NaN", function(next) {
      s.validate({ age: NaN }, function(err) {
        expect(err.message).to.be("'age' must be a number");
        next()
      })
    });

    it("fail if string", function(next) {
      s.validate({ age: "1" }, function(err) {
        expect(err.message).to.be("'age' must be a number");
        next()
      })
    });

    it("succeed if number", function(next) {
      s.validate({ age: 0 }, function(err) {
        expect(err).to.be(null);
        next()
      })
    });

    it("fail if required and null", function(next) {
      s2.validate({ age: null }, function(err) {
        expect(err.message).to.be("'age' must be defined");
        next()
      });
    });

    it("succeed if not required and null", function(next) {
      s.validate({ age: null }, function(err) {
        expect(err).to.be(null);
        next()
      });
    })
  });


  describe("custom testers", function() {

    var s = linen.schema({
      name: {
        $type: "string",
        $validate: [
          function(value, next) {
            if(value == "john") return next(new Error("cannot be john"));
            next();
          },
          function(value, next) {
            if(value == "jake") return next(new Error("cannot be jake"));
            next();
          }
        ]
      }
    }),
    s2 = linen.schema({
      name: {
        $type: "string",
        $validate: function(value, next) {
          if(value == "craig") return next(new Error("cannot be craig"));
          return next();
        }
      }
    });


    it("succeeds if name isn't john", function(next) {
      s.validate({ name: "jeff" }, function(err) {
        expect(err).to.be(null);
        next();
      })
    });

    it("succeeds if name isn't craig", function(next) {
      s2.validate({ name: "jeff" }, function(err) {
        expect(err).to.be(null);
        next();
      })
    });

    it("fails if name is john", function(next) {
      s.validate({ name: "john" }, function(err) {
        expect(err.message).to.be("'name' cannot be john");
        next();
      })
    });

    it("fails if name is jake", function(next) {
      s.validate({ name: "jake" }, function(err) {
        expect(err.message).to.be("'name' cannot be jake");
        next();
      })
    });

    it("fails if name is craig", function(next) {
      s2.validate({ name: "craig" }, function(err) {
        expect(err.message).to.be("'name' cannot be craig");
        next();
      })
    });

    it("succeeds if name is undefined", function(next) {
      s2.validate({ name: undefined }, function(err) {
        expect(err).to.be(null);
        next();
      });
    });
  });

  return;


  describe("default fields", function() {

  });

  
  describe("nested fields", function() {

  });

  describe("can define a simple validation", function(next) {

    it("with a default message", function() {

    });

    it("with a custom message", function() {

    })
    var schema = linen.schema({
      fields: {
        "name": {
          $type: "string",
          $validate: {
            message: "incorrect name",
            test: function(value) {
              return value != "craig";
            }
          }
        }
      }
    });

    schema.validate({ name: "craig" }, function(err) {

      schema.validate({ name: "john" }, function(err) {
        expect(err.message).to.be("incorrect.name");
      })
    });
  });


  it()

  return;


  it("can perform an asynchronous validation", function() {
    var schema = linen.schema({
      fields: {
        "username": {
          $type: "string",
          $validate: {
            message: "username taken",
            test: function(value, next) {
              setTimeout(function() {
                next(null, value == "craig");
              }, 500);
            }
          }
        }
      }
    });

    schema.validate({ name: "craig" }, function(err) {
      expect(err.message).to.be("username taken");
      schema.validate({ name: "john" }, function(err) {
        expect(err).to.be(undefined);
      })
    });
  })

  describe("against types", function() {
    it("works with strings", function() {

    });

  });

  describe("required params", function() {
    it("doesn't fail on false / 0", function() {

    })
  })

  describe("defined rules", function() {

  });
});