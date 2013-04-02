bindable = require "bindable"
async    = require "async"
outcome  = require "outcome"
asyngleton = require "asyngleton"

module.exports = class extends bindable.Collection

  ###
  ###

  constructor: (@collectionName, @modelBuilder, @options = {}) ->

    super()

    @options.path = @route.path or @collectionName 
    @options.collectionName = @collectionName


    @_modelClass = options.modelClass


    # virtual collections are NOT part of model data, where the collection needs to be fetched remotely
    @_isVirtual  = options.virtual isnt false

    # static collections ARE part of model data, where the source doesn't need to be fethc remotely
    @_isStatic   = options.static

    @_initCollection()

  ###
  ###

  route: () -> @options

  ###
  ###

  item: (data) ->
    if typeof data is "string"
      data = { _id: data }
    else 
      data = data

    model = new @_modelClass data
    model.route @options

    # set the parent - this is needed to add the model to the collection if it's new, or fetched.
    model.parent = @
    model

  ###
  ###

  _initCollection: () ->
    @_initTransformations()

  ###
  ###

  _initTransformations: () ->

    # first cast as a model class item, then check if it's a string. If it is, then it's an ID
    @transform().cast(@_modelClass).map (itemOrId) =>
      if typeof itemOrId is "object"
        item = itemOrId
      else
        item = { _id: itemOrId }


    @transform().postMap (item) =>
      item.route @options
      item

  ###
  ###

  reset: (source) ->

    if source.__isCollection
      source = source.source()

    # if the source is NOT static, and NOT virtual (basically, just a list of IDs), then
    # remove the source. Strings are unacceptable since they're not restful
    if not @_isStatic and typeof source[0] is "string"
      source = []

    super source

  ###
   override bind so that fetch is called each time
  ###

  bind: (to) ->
    @fetch()

    if not arguments.length
      super()
    else
      super to

  ###
  ###

  save: (next) ->
    async.forEach @source(), ((item, next) ->
      item.save next
    ), next

  ###
  ###

  fetch: asyngleton true, (callback) ->

    return callback() if @_isStatic

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
      method: "GET",
      item: @
    }

    @modelBuilder.linen.resource.request request, outcome.e(callback).s (source) =>
      @reset source
      callback()







