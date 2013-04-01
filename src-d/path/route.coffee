Decor = require "./decor"
isa   = require "isa"
EventEmitter = require("events").EventEmitter
Collection = require "./collection"
PathModelBuilder = require "./pathModelBuilder"

module.exports = class extends EventEmitter

  ###
  ###

  constructor: (@pluralName, @route) ->
  
    @linen = @route.linen
    @_options = {}
    @_decor = new Decor @

    # fetch the schema for this route - remove the plural name with a singular name
    @schema = @linen.schema @singularName = pluralName.replace /e?s$/, ""

    # optional decor
    @_registerProperty property for property in ["flatten", "mapItem", "mapResponse", "mapRoute"]

    # decor that always sticks
    @_registerDecor { 
        "mapUrl": null,
        "fetch": { 
          host: @linen.host, 
          collection: @pluralName 
        }, 
        "mapResponse": @linen.mapResponse() 
    }

    @_modelBuilder = new RouteModelBuilder @

  ###
  ###

  mapItemUrl: (value) ->
    return @_itemUrlMapper if not arguments.length
    @_itemUrlMapper = value
    @

  ###
  ###

  mapCollectionUrl: (value) ->
    return @_collectionUrlMapper if not arguments.length
    @_collectionUrlMapper = value
    @

  ###
  ###

  route: (name) ->
    return @_paths[name] or (@_paths[name] or new Route(name, @, @linen)

  ###
  ###

  collection: (query = {}) -> new Collection @, query

  ###
  ###

  item: () -> new @_modelBuilder.getClass() 

  ###
  ###

  fetch: (options, callback) ->

    # prepare the url

    @_registerDecor() if not @_registered
    @_registered = true
    @_decor.fetch options, callback


  ###
  ###

  _registerProperty: (property) ->

    # make it a method
    @[property] = (options) =>
      return @_options[property] if not arguments.length
      @_options[property] = options

  ###
  ###

  _registerDecor: (options) ->
    for key of (options or @_options)
      @_decor.register key, @_options[key]

