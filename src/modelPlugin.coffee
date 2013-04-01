Collection = require("bindable").Collection
cstep = require "cstep"
dref = require "dref"
outcome = require "outcome"
async = require "async"
_ = require "underscore"
Collection = require("./collection")

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
    options.modelClass = @modelClass
    return new Collection path, @, options


  ###
  ###

  _modelBuilderCreateCollection: (item, definition) => 

    schemaName     = definition.options.$ref
    collectionName = definition.key
    route = _.extend {}, @route, definition.options.$route or {}

    # copy the definition properties over to the collection
    @createCollection collectionName, route

  ###
  ###

  _fetch: (options, callback) ->
    @linen._request options, callback

  ###
  ###

  _setup: () ->

    self = @

    modelBuilder = @modelBuilder = @schema.modelBuilder
    modelBuilder.createCollection = @_modelBuilderCreateCollection
    @modelClass = modelBuilder.getClass()
    name = modelBuilder.name

    oldInitData = @modelClass.prototype._initData

    modelBuilder.methods._initData = (data) ->

      # id MAYBE a string - which is an _id. If this is the case, then
      # handle it accordingly
      if typeof data is "string"
        data = { _id: data }
      else
        data = data

      oldInitData.call @, data

    modelBuilder.methods.route = (options) ->

      if arguments.length
        @_route = _.extend @_route or {}, options
        return @


      _.extend {}, @_route, @definition?.options.$route or {}



    oldSet = @modelClass.prototype._set
    modelBuilder.methods._set = (key, value) ->
      oldSet.apply @, arguments

      # set the properties that have changed
      if not @_update
        @_update = {}

      dref.set @_update, key, value

    modelBuilder.methods.hydrate = (key, value) ->
      @set.apply @, arguments
      @_update = {}
      @

    modelBuilder.methods.fetch = (next = (()->)) ->
      @once "loaded", next
      return if @_loading
      @_loading = true
      @_fetch outcome.e(next).s (result) =>
        @_loading = false


    modelBuilder.methods._fetch = cstep (next) ->

      request = {
        method: "GET",
        item: @
      }

      self._fetch { method: "GET", item: @, one: true }, outcome.e(next).s (result) =>
        @hydrate result
        @emit "loaded"
        next()


    modelBuilder.methods.isNew = () -> @_isNew

    modelBuilder.pre "save", cstep (next) ->
      @validate next

    modelBuilder.pre "save", (next) ->
      if @isNew()
        self._fetch { method: "POST", item: @, data: @_update }, next
      else if _.keys(@_update).length
        self._fetch { method: "PUT", item: @, data: @_update }, next

    modelBuilder.pre "remove", cstep (next) ->

      return next(new Error("cannot remove a new item")) if @isNew()
      self._fetch { method: "DELETE", item: @ }, next




exports.plugin = (linen, modelBuilder) ->
  plugin = new ModelPlugin linen, modelBuilder
  modelBuilder.schema.linenBuilder = plugin
  modelBuilder.linenBuilder = plugin
  plugin
