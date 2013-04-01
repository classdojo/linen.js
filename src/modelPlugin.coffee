Collection = require("bindable").Collection
cstep = require "cstep"
dref = require "dref"
outcome = require "outcome"

class ModelPlugin
  
  ###
  ###

  constructor: (@linen, @modelBuilder) ->
    @schema = modelBuilder.schema
    @_setup()

  ###
  ###

  createItem: (path, data = {}) ->
    data.requestOptions = { path: path }
    model = new @modelClass data
    model.fetch()
    model

  ###
  ###

  createCollection: (path, options = {}) ->
    collection = new Collection()
    self = @

    collection.requestOptions = { path: path, params: options.params or {}, query: options.query or {} }
    
    collection.transform().map (itemOrId) =>

      if typeof itemOrId is "object"
        item = itemOrId
        # @_noFetch = not @_fetched and true
      else
        item = { _id: itemOrId }
        collection.__fetchRef = true

      item

    collection.transform().postMap (item) =>
      item.requestOptions = { path: path, itemId: item._id }
      item


    # do NOT remove - this could be a bad thing
    # saves all the items in the collection
    collection.save = (next) ->
      async.forEach @source(), ((item, next) ->
        item.save next
      ), next

    collection.fetch = cstep (callback) ->

      # source has items?
      if @length()

        # were the items filled with ID's?
        if @__fetchRef 
          @_fetchRef callback

      else
        @_fetchSub callbac


    collection._fetchRef = (next) ->
      async.forEach @source(), ((item, next) ->
        item.fetch next
      ), next

    collection._noFetch = (callback) ->

    collection._fetchSub = (callback) ->
      self._fetch { method: "GET", item: @ }, callback


    collection

  ###
  ###

  _modelBuilderCreateCollection: (item, definition) => 

    schemaName     = definition.options.$ref
    collectionName = definition.key

    path = definition.options.$route or [item.requestOptions.path, definition.key].join(".")

    console.log path
    @createCollection path

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
        @requestOptions = {}
      else
        data = data
        @requestOptions = data.requestOptions
        delete data.requestOptions


      oldInitData.apply @, arguments


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
      @requestOptions[name] = @get "_id"
      self._fetch { method: "GET", item: @ }, outcome.e(next).s (result) =>
        @hydrate result
        @emit "loaded"
        next()


    modelBuilder.methods.isNew = () -> !get "_id"

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
