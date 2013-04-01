Collection = require("bindable").Collection
cstep = require "cstep"
dref = require "dref"
outcome = require "outcome"
async = require "async"
_ = require "underscore"

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
    collection._fetched = false
    self = @

    # is this a virtual collection? i.e: not stored in the item doc
    isVirtual = options.definition?.$isVirtual

    # is it a static collection? o.e: reference to objects are in collection already
    isStatic = options.definition?.$isStatic

    oldReset = collection.reset
    collection.reset = (source) ->

      if source.__isCollection
        source = source.source()

      if not isStatic
        @_fetchSource = source
        source = []

      oldReset.call @, source

    collection.requestOptions = { path: path, params: options.params or {}, query: options.query or {} }
    
    collection.transform().map (itemOrId) =>

      if typeof itemOrId is "object"
        item = itemOrId
      else
        item = { _id: itemOrId }

      item

    collection.transform().postMap (item) =>
      item.requestOptions = { path: path }
      item


    # do NOT remove - this could be a bad thing
    # saves all the items in the collection
    collection.save = (next) ->
      async.forEach @source(), ((item, next) ->
        item.save next
      ), next

    oldBind = collection.bind
    collection.bind = () ->
      @fetch()
      oldBind.apply @, arguments

    collection.fetch = (callback = (() ->)) ->
      @once "loaded", callback
      return if @_loading 
      @_loading = true

      onResult = () =>
        @_loading = false
        @emit "loaded"

      return onResult() if isStatic

      if not isVirtual
        @_fetchReference onResult
      else
        @_fetchVirtual onResult


    collection._fetchReference = (next) ->
      async.forEach @_fetchSource, ((_id, next) =>
        if ~(i = @indexOf({ _id: _id }))
          item = @at i
        else
          item = @_transform { _id: _id }

        item.fetch outcome.e(next).s () =>
          if not ~i
            @push item
          next()
      ), next

    collection._fetchVirtual = (callback) ->
      self._fetch { method: "GET", item: @ }, callback


    collection

  ###
  ###

  _modelBuilderCreateCollection: (item, definition) => 

    schemaName     = definition.options.$ref
    collectionName = definition.key

    path = definition.options.$path or [item.requestOptions.path, definition.key].join(".")

    @createCollection path, { definition: definition }

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
        @requestOptions = data.requestOptions or {}
        delete data.requestOptions

      oldInitData.call @, data


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
      @requestOptions.path = @ownerDefinition?.options.$path or @requestOptions.path or name
      
      self._fetch { method: "GET", item: @, one: true }, outcome.e(next).s (result) =>
        @hydrate result
        @emit "loaded"
        next()


    modelBuilder.methods.isNew = () -> not get "_id"

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
