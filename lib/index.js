// Generated by CoffeeScript 1.6.2
(function() {
  var Linen, ModelPlugin, Resource, mannequin, outcome;

  mannequin = require("mannequin");

  ModelPlugin = require("./modelPlugin");

  outcome = require("outcome");

  Resource = require("./resource");

  Linen = (function() {
    /*
    */
    function Linen(options) {
      this.options = options;
      this.schemas = mannequin.dictionary();
      this._schemasByCollectionName = {};
      this.resource = new Resource(options, this);
      if (options.schemas) {
        this._registerSchemas(options.schemas);
      }
      this._registerRoutes(options.routes);
    }

    /*
    */


    Linen.prototype.collection = function(collectionName, query) {
      if (query == null) {
        query = {};
      }
      return this._schemasByCollectionName[collectionName].createCollection(collectionName, {
        query: query
      });
    };

    /*
    */


    Linen.prototype._registerSchemas = function(schemas) {
      var key, _results;

      _results = [];
      for (key in schemas) {
        _results.push(this._registerSchema(key, schemas[key]));
      }
      return _results;
    };

    /*
    */


    Linen.prototype._registerRoutes = function(routes) {
      var builder, collectionName, route, _results;

      _results = [];
      for (collectionName in routes) {
        route = routes[collectionName];
        builder = this._schemasByCollectionName[collectionName] = this._registerSchema(route.name, route.schema);
        delete route.schema;
        builder.route = route;
        _results.push(builder.route.root = true);
      }
      return _results;
    };

    /*
    */


    Linen.prototype._registerSchema = function(name, schema) {
      return ModelPlugin.plugin(this, this.schemas.register(name, schema));
    };

    return Linen;

  })();

  module.exports = function(options) {
    return new Linen(options);
  };

}).call(this);