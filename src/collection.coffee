bindable = require "bindable"
async    = require "async"
outcome  = require "outcome"
asyngleton = require "asyngleton"
type = require "type-component"

module.exports = class Collection extends bindable.Collection

  ###
  ###

  constructor: (@collectionName, @modelBuilder, @options = {}) ->

    super()

    @options.path = @route.path or @collectionName 
    @options.collectionName = @collectionName


    @_modelClass = options.modelClass
    @_modelBuilder = @_modelClass.builder


    # virtual collections are NOT part of model data, where the collection needs to be fetched remotely
    @_isVirtual  = options.virtual isnt false

    # static collections ARE part of model data, where the source doesn't need to be fethc remotely
    @_isStatic   = options.static

    @_initCollection()

    @on "insert" , @_persistInsert
    @on "remove" , @_persistRemove
    @on "reset"  , @_onReset

  ###
  ###

  route: () -> @options

  ###
  ###

  item: (data) ->
    Item = @getModelClass()
    return new Item data

  ###
  ###

  getModelClass: () ->

    if @_class
      return @_class

    self = @

    @_class = class extends @_modelClass

      ###
      ###

      _initData: (data) ->
        super data
        @route self.options
        @parent = self

    @_class.collection = @

    @_class


  ###
  ###

  _initCollection: () ->
    @_initTransformations()

  ###
  ###

  _initTransformations: () ->


    @transform().
    map(@_modelBuilder._castRefClass(@getModelClass())).
    postMap (item) =>
      item.route @options
      item

  ###
  ###

  clear: () ->
    @shift() while @length()

  ###
  ###

  reset: (source) ->


    @_resetting = true

    if source.__isCollection
      source = source.source()

    # if the source is NOT static, and NOT virtual (basically, just a list of IDs), then
    # remove the source. Strings are unacceptable since they're not restful
    if (not @_isStatic and (type(source[0]) is "string")) or not (type(source) is "array")
      source = []
    else if @_isVirtual and not @_fetching
      source = []

    result = super source
    @_resetting = false
    result

  ###
  ###

  pushNoPersist: (item) ->
    @_resetting = true
    @push item
    @_resetting = false


  ###
   override bind so that fetch is called each time
  ###

  bind: (to) ->
    @fetch()

    Collection.__super__.bind.apply @, arguments


  ###
  ###

  save: (next) ->
    async.forEach @source(), ((item, next) ->
      item.save next
    ), next

  ###
  ###

  fetch: asyngleton true, (callback) ->
    @_fetching = []

    return callback() if @_isStatic or (@parent and not @parent.__isCollection and not @parent.data._id)

    if not @_isVirtual 
      @_fetchReference callback
    else
      @_fetchVirtual callback


  ###
  ###

  _fetchReference: (next) ->

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

  ###
  ###

  _fetchVirtual: (callback) ->

    request = {
      method: "GET"
    }

    @_request request, outcome.e(callback).s (source) =>
      @reset source
      callback()

  ###
  ###

  _request: (request, callback = (() ->)) ->
    request.collection = @
    @modelBuilder.linen.resource.request request, callback

  ###
  ###

  _persistRemove: (item) ->
    return if @_resetting or item.removed

    request = {
      method: "DELETE",
      item: item
    }

    @_request request

  ###
  ###

  _onReset: (items) -> 
    for item in items
      @_persistInsert item


  ###
  ###

  _persistInsert: (item) ->
  
    # explicitly called .remove() on model
    item.once "remove", () => @splice @indexOf(item), 1
    
    return if @_resetting

    request = {
      method: "POST",
      body: item
    }

    
    @_request request










