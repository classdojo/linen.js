mannequin = require "mannequin"
Route     = require "./route"
ModelPlugin = require "./modelPlugin"

class Linen
  
  ###
  ###

  constructor: (options) ->

    @schemas = mannequin.dictionary()


    for key of options.schemas
      ModelPlugin.plugin @, @schemas.register key, options.schemas[key]

    # maps the routes based on the schema path
    @_route = new Route options
    @_transport = options.transport


  ###
  ###

  item: (path, query = {}) ->
    modelBuilder = @_modelBuilderByPath path
    modelBuilder.linenBuilder.createItem path, query

  ###
  ###

  collection: (path, query = {}) ->
    modelBuilder = @_modelBuilderByPath path
    modelBuilder.linenBuilder.createCollection path, query

  ###
  ###

  _request: (options, next) ->
    ro = options.item.requestOptions

    # remove root path
    path = @_route.route(ro.path).path(ro).substr(1)
    



  ###
  ###

  _modelBuilderByPath: (path) -> @schemas.modelBuilder @_route.route(path).schemaName





module.exports = (options) -> new Linen options




module.exports.Route = Route
