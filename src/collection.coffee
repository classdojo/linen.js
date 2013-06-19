bindable  = require "bindable"
payload   = require "./payload"
_         = require "underscore"
Model     = require "./model"
flatstack = require "flatstack"
memoize   = require "memoizee"

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

    @transform().map (model) =>
      model = field.map model
      model.owner = @owner
      @_watchRemove model
      model

    @on 
      insert : @_persistInsert
      remove : @_persistRemove
      reset  : @_persistReset


    @fetch = memoize ((next) ->
      @_fetch next
    ), { maxAge: 1000 * 5, async: true }

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

    @_watchRemove model

    return model

  ###
  ###

  _watchRemove: (model) ->
    model.once "remove", (err) =>
      @_ignorePersist = true
      i = @indexOf model
      if ~i
        @splice i, 1
      @_ignorePersist = false



  ###
  ###

  hasChanged: () ->
    for item in @source()
      return true if item.hasChanged()
    return false


  ###
  ###

  _fetch: (next = ()->) ->
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
    @fetch()
    binding


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