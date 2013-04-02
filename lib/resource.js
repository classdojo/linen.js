// Generated by CoffeeScript 1.6.2
(function() {
  var async, outcome, toarray,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  toarray = require("toarray");

  outcome = require("outcome");

  async = require("async");

  module.exports = (function() {
    /*
    */
    function _Class(options, linen) {
      this.linen = linen;
      this._request = __bind(this._request, this);
      this.transport = options.transport;
      this.host = options.host;
      this._mapPath = options.mapPath || this._defaultMapPath;
      this._mapResponse = options.mapResponse || this._defaultMapResponse;
      this._mapItem = options.mapItem || this._defaultMapItem;
      this._mapCollection = options.mapCollection || this._defaultMapCollection;
      this._cargo = async.queue(this._request, Math.max(3, options.requestLimit || 10));
    }

    /*
    */


    _Class.prototype.request = function(options, callback) {
      return this._cargo.push(options, callback);
    };

    /*
    */


    _Class.prototype._request = function(options, callback) {
      var body, collection, item, method, o, one, params, path, query,
        _this = this;

      method = options.method;
      item = options.item;
      collection = options.collection;
      params = options.params || {};
      query = options.query || {};
      body = JSON.parse(JSON.stringify(options.body || {}));
      one = options.one;
      path = this._mapPath({
        method: method,
        item: item,
        params: params,
        collection: collection
      });
      o = outcome.e(callback);
      return this.transport.request({
        host: this.host,
        path: path,
        method: method,
        query: query,
        body: body
      }, o.s(function(response) {
        return _this._mapResponse(response, o.s(function(result) {
          if (one) {
            return callback(null, _this._mapItem(result));
          } else {
            return callback(null, _this._mapCollection(result));
          }
        }));
      }));
    };

    /*
    */


    _Class.prototype._defaultMapResponse = function(response, next) {
      var _ref;

      if (response.error || response.errors) {
        return next(((_ref = response.errors) != null ? _ref[0] : void 0) || response.error);
      }
      return next(null, response.result || response);
    };

    /*
    */


    _Class.prototype._defaultMapItem = function(result) {
      return toarray(result).shift();
    };

    /*
    */


    _Class.prototype._defaultMapCollection = function(result) {
      return toarray(result);
    };

    /*
     maps a restful path
    */


    _Class.prototype._defaultMapPath = function(options) {
      var paths;

      paths = [];
      if (options.collection) {
        this._mapPathPart(options.collection, options, paths, true);
        if (options.item) {
          paths.unshift(options.item.get("_id"));
        }
      } else if (options.item) {
        this._mapPathPart(options.item, options, paths, true);
      }
      paths = paths.reverse();
      return paths.join("/");
    };

    /*
     TODO - separate collection from item
    */


    _Class.prototype._mapPathPart = function(currentItem, options, paths, root) {
      var croute, _id;

      if (!currentItem) {
        return paths;
      }
      croute = currentItem.route();
      if (currentItem.__isCollection) {
        if (root) {
          paths.push(croute.collectionName);
        } else {
          return this._mapPathPart(currentItem.parent, options, paths);
        }
      } else {
        if (_id = currentItem.get("_id")) {
          paths.push(_id);
        }
        if (croute.inherit === true) {
          paths.push(croute.collectionName);
        } else {
          paths.push(croute.path);
          return paths;
        }
      }
      return this._mapPathPart(currentItem, options, paths, false);
    };

    return _Class;

  })();

}).call(this);