Collection = require("bindable").Collection
dref = require "dref"
_ = require "underscore"
outcome = require "outcome"
cstep = require "cstep"
async = require "async"

module.exports = class

  ###
  ###

  constructor: (@schema, @linen) ->
    @schema.modelPlugin = @
    @_setup()

  ### 
  ###

  createItem: (route, query = {}, data = {}) ->
    model = new @modelClass data
    model._route = route
    model.requestOptions = { query: query }
    model.fetch()
    model

  ###
  ###

  createCollection: (route, query = {}) =>

    collection = new Collection()
    collection._route = route
    collection.route = () ->
      @_route or @parent?.route()

    collection.requestOptions = { query: query }
    
    collection.transform().map (itemOrId) =>

      if typeof itemOrId is "object"
        item = itemOrId
        # @_noFetch = not @_fetched and true
      else
        item = { _id: itemOrId }
        collection.__fetchRef = true

      item

    collection.transform().postMap (item) =>
      item._route = route
      item.requestOptions = { itemId: item._id }
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
      route.fetch { method: "GET", item: @ }, callback


    collection

  ###
  ###

  _modelBuilderCreateCollection: (item, definition) => 
    route = @linen.route definition.options.$ref, definition.key
    route.collection()

  ###
  ###

  _setup: () ->

    modelBuilder = @modelBuilder = @schema.modelBuilder
    modelBuilder.createCollection = @_modelBuilderCreateCollection
    @modelClass = modelBuilder.getClass()

    oldInitData = @modelClass.prototype._initData

    modelBuilder.methods.route = () ->
      @_route or @parent?.route()

    modelBuilder.methods._initData = (data) ->

      if typeof data is "string"
        data = { _id: data }
      else
        data = data

      @requestOptions = {}

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
      @requestOptions.itemId = @get "_id"
      @route().fetch { method: "GET", item: @ }, outcome.e(next).s (result) =>
        @hydrate result
        @emit "loaded"
        next()


    modelBuilder.methods.isNew = () -> !get "_id"

    modelBuilder.pre "save", cstep (next) ->
      @validate next

    modelBuilder.pre "save", (next) ->
      if @isNew()
        @route().fetch { method: "POST", item: @, data: @_update }, next
      else if _.keys(@_update).length
        @route().fetch { method: "PUT", item: @, data: @_update }, next

    modelBuilder.pre "remove", cstep (next) ->

      return next(new Error("cannot remove a new item")) if @isNew()
      @route().fetch { method: "DELETE", item: @ }, next








