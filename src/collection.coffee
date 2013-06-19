bindable  = require "bindable"
payload   = require "./payload"
_         = require "underscore"
Model     = require "./model"
flatstack = require "flatstack"

class Collection extends bindable.Collection
  
  ###
  ###

  __isCollection: true
  
  ###
  ###

  constructor: (@field) ->
    super()

    @_callstack = flatstack()

    @_callstack.error (err) ->
      console.error err

    @transform().map (model) ->
      return field.map model

    @on 
      insert : @_persistInsert
      remove : @_persistRemove
      reset  : @_persistReset

  ###
  ###

  model: (data) -> 
    model = @field.linen.model(@field.options.ref, data)
    model.collection = @
    model.owner = @owner

    model.once "save", (err) =>
      return if err?
      @_ignorePersist = true
      @push model
      @_ignorePersist = false

    model.once "remove", (err) =>
      i = @indexOf model
      if ~i
        @splice i, 1

    return model


  ###
  ###

  hasChanged: () ->
    for item in @source()
      return true if item.hasChanged()
    return false


  ###
  ###

  fetch: (next = ()->) ->
    return next() unless @field.isVirtual()

    @_callstack.push (next) =>
      @field.fetch payload.collection(@).method("GET").data, (err, models) =>
        return next(err) if err?
        @_reset models
        next()

    @_callstack.push () => next()
    @



  ###
  ###

  bind: (options) ->
    binding = super arguments...
    @_throttledFetch()
    binding


  ###
  ###

  _throttledFetch: _.throttle (() ->  
    @fetch()
  ), 1000 * 5

  ###
  ###

  save: () ->

  ###
  ###

  _reset: (source) ->
    @_ignorePersist = true
    @source source
    @_ignorePersist = false

  ###
  ###

  toJSON: () ->
    models = []
    for model in @source()
      models.push model.push if model.__isModel then model.toJSON() else model

    models


  ###
  ###

  _persistInsert: (model) ->
    return if @_ignorePersist or @owner.isNew()
    @_callstack.push (next) =>
      @field.fetch payload.collection(@).target(model).method("POST").data, next


  ###
  ###

  _persistRemove: (model) ->
    return if @_ignorePersist or @owner.isNew()
    return if model.isNew()
    @_callstack.push (next) =>  
      @field.fetch payload.collection(@).target(model).method("DELETE").data, next



  ###
  ###

  _persistReset: () ->
    throw new Error "cannot persist reset (not implemented)"





module.exports = Collection