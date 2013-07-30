// Generated by CoffeeScript 1.6.2
(function() {
  var TypeValidator, type;

  type = require("type-component");

  TypeValidator = (function() {
    /*
    */
    function TypeValidator(options) {
      this.type = options.type;
      this.message = options.message || ("must be a " + this.type);
    }

    /*
    */


    TypeValidator.prototype.validate = function(value, next) {
      var t, valid;

      t = type(value);
      valid = t === this.type;
      switch (t) {
        case "number":
          valid = valid && !isNaN(value);
      }
      if (!valid) {
        return next(new Error(this.message));
      } else {
        return next();
      }
    };

    /*
    */


    TypeValidator.test = function(options) {
      return !!options.type;
    };

    return TypeValidator;

  })();

  module.exports = TypeValidator;

}).call(this);