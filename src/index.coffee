mannequin = require "mannequin"
Route     = require "./route"
ModelPlugin = require "./modelPlugin"
outcome = require "outcome"

class Linen
  
  ###
  ###

  constructor: (options) ->

    @schemas = mannequin.dictionary()
    @transport = options.transport
    @host = options.host


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
    route = @_route.route(ro.path)
    path = route.path(ro).substr(1)

    o = outcome.e next

    @transport.request {
      host: @host,
      path: path,
      method: options.method,
      data: options.data or {}
    }, o.s (response) ->
      route.mapResponse response, o.s (response) ->
        if options.one
          next null, route.mapItem response
        else
          next null, route.mapCollection response


    



  ###
  ###

  _modelBuilderByPath: (path) -> @schemas.modelBuilder @_route.route(path).schemaName





module.exports = (options) -> new Linen options




module.exports.Route = Route
