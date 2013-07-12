bindable  = require "bindable"
payload   = require "./payload"
_         = require "underscore"
Model     = require "./model"
flatstack = require "flatstack"
memoize   = require "./memoize"

class Collection extends bindable.Collection
  
  ###
  ###

  __isCollection: true
  
  ###
  ###

  constructor: (@field) ->
    super()
    @linen = field.linen


    @transform().map (model) =>
      model = @_map model
      model.owner = @owner
      @_watchRemove model
      model

    @on 
      insert : @_persistInsert
      remove : @_persistRemove
      reset  : @_persistReset


    @fetch = memoize ((next) =>
      @_fetch next
    ), { maxAge: 1000 * 5 }

  ###
  ###

  _map: (data) -> if data?.__isModel then data else @linen.model(@field.options.ref, data)

  ###
  ###

  model: (data) -> 
    model = @_map data
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

  clear: () ->
    source = @source().concat()
    for model in source
      model.remove()
      
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

    @field.fetch payload.collection(@).method("GET").data, (err, models) =>
      return next(err) if err?
      @_reset models
      next()

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

  _reset: (src) ->
    @_ignorePersist = true

    # fix issue when removing items within an array
    src = src
    esrc = @source().concat()

    # remove old item
    for existingItem, i in esrc
      found = false
      for newItem in src
        if existingItem.get("_id") is newItem._id
          found = true
          break

      unless found
        @splice i, 1


    # update existing
    for existingItem in esrc
      for newItem, i in src
        if existingItem.get("_id") is newItem._id
          existingItem.set newItem
          src.splice i, 1
          break


    # insert the reset
    @push(item) for item in src


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
    @field.fetch payload.collection(@).target(model).method("POST").data, next


  ###
  ###

  _persistRemove: (model) ->
    return if @_ignorePersist or @owner.isNew()
    return if model.isNew()
    @field.fetch payload.collection(@).target(model).method("DELETE").data, next



  ###
  ###

  _persistReset: () ->
    throw new Error "cannot persist reset (not implemented)"





module.exports = Collection