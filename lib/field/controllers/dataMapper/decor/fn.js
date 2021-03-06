// Generated by CoffeeScript 1.6.2
/*
  field: {
    $map: (value) -> String(value).toUpperCase()
  }
*/


(function() {
  var FnMapper,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FnMapper = (function(_super) {
    __extends(FnMapper, _super);

    /*
    */


    function FnMapper(field) {
      FnMapper.__super__.constructor.call(this, field);
      this._map = field.options.map;
    }

    /*
    */


    FnMapper.prototype.map = function(model, data) {
      data = this._map.call(model, data);
      return data;
    };

    /*
    */


    FnMapper.test = function(field) {
      return !!field.options.map;
    };

    return FnMapper;

  })(require("./base"));

  module.exports = FnMapper;

}).call(this);
