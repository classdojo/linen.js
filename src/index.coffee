mannequin = require "mannequin"
ModelPlugin = require "./modelPlugin"
outcome = require "outcome"
Resource = require "./resource"

class Linen
  
  ###
  ###

  constructor: (@options) ->

    @schemas = mannequin.dictionary()

    @_schemasByCollectionName = {}
    @resource = new Resource options, @

    if options.schemas
      @_registerSchemas options.schemas

    @_registerRoutes options.routes

  ###
  ###

  collection: (collectionName, query = {}) ->
    @_schemasByCollectionName[collectionName].createCollection collectionName, { query: query }

  ###
  ###

  _registerSchemas: (schemas) -> 
    for key of schemas
      @_registerSchema key, schemas[key]

  ###
  ###

  _registerRoutes: (routes) ->
    for collectionName of routes
      route = routes[collectionName]
      builder = @_schemasByCollectionName[collectionName] = @_registerSchema(route.name, route.schema)
      delete route.schema
      builder.route = route
      builder.route.root = true

  ###
  ###

  _registerSchema: (name, schema) -> 
    ModelPlugin.plugin @, @schemas.register name, schema



module.exports = (options) -> new Linen options

