Collection = require("bindable").Collection
cstep = require "cstep"
dref = require "dref"
outcome = require "outcome"
async = require "async"
_ = require "underscore"
Collection = require("./collection")
createLinenModel = require("./model")

class ModelPlugin
  
  ###
  ###

  constructor: (@linen, @modelBuilder) ->
    @schema = modelBuilder.schema
    @route = {}
    @_setup()

  ###
  ###

  createCollection: (path, options = {}) ->
    options.modelClass = options.modelClass or @modelClass
    return new Collection path, @, options


  ###
  ###

  _modelBuilderCreateCollection: (item, definition) => 

    schemaName     = definition.options.$ref
    collectionName = definition.key
    route = _.extend {}, @route, definition.options.$route or {}
    route.modelClass = definition.schemaRef()?.linenBuilder.modelClass

    # copy the definition properties over to the collection
    @createCollection collectionName, route

  ###
  ###

  _setup: () ->

    self = @

    modelBuilder = @modelBuilder = @schema.modelBuilder

    # override collection factory
    modelBuilder.createCollection = @_modelBuilderCreateCollection

    @modelClass = createLinenModel(@, modelBuilder.getClass())
    modelBuilder.setClass @modelClass





exports.plugin = (linen, modelBuilder) ->
  plugin = new ModelPlugin linen, modelBuilder
  modelBuilder.schema.linenBuilder = plugin
  modelBuilder.linenBuilder = plugin
  plugin
