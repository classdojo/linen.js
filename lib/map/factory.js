// Generated by CoffeeScript 1.6.2
(function() {
  var DefaultMap, GetterSetterMap, NoMap, ReferenceMap;

  GetterSetterMap = require("./gs");

  DefaultMap = require("./default");

  ReferenceMap = require("./reference");

  NoMap = require("./none");

  module.exports = function(field) {
    if (field.options["default"] != null) {
      return new DefaultMap(field);
    }
    if (field.options.get || field.options.set) {
      return new GetterSetterMap(field);
    }
    if (field.options.ref) {
      return new ReferenceMap(field);
    }
    return new NoMap();
  };

}).call(this);