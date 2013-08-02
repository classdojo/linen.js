// Generated by CoffeeScript 1.6.2
(function() {
  var ClassFactory, Factory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  ClassFactory = require("./clazz");

  Factory = (function(_super) {
    __extends(Factory, _super);

    /*
    */


    function Factory() {
      var factoriesOrClasses;

      factoriesOrClasses = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this._factories = factoriesOrClasses.map(function(clazz) {
        if (clazz.__isFactory) {
          return clazz;
        }
        return new ClassFactory(clazz);
      });
    }

    return Factory;

  })(require("./base"));

  module.exports = Factory;

}).call(this);