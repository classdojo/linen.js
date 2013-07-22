bindable  = require "bindable"
payload   = require "./payload"
_         = require "underscore"
Model     = require "./model"
flatstack = require "flatstack"
memoize   = require "./memoize"
type      = require "type-component"

class Collection extends bindable.Collection
  
  ###
  ###

  __isCollection: true
  
  ###
  ###

  constructor: (@field) ->
    super()
    @linen = field.linen

    @_callstack = flatstack()


    @transform().map (model) =>
      model = @_map model
      model.setOwner? @owner
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

  _map: (data) -> 
    return data unless @field.options.ref
    if data?.__isModel then data else @linen.model(@field.options.ref, data)

  ###
  ###

  model: (data) -> 
    model = @_map data
    
    return model unless @field.options.ref

    model.collection = @
    model.setOwner? @owner

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
    model.once? "remove", (err) =>
      @_ignorePersist = true
      i = @indexOf model
      if ~i
        @splice i, 1
      @_ignorePersist = false


  ###
  ###

  setOwner: (value) ->
    @owner = value
    @set "_owner", value

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

        if models
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

  _reset: (src) ->
    return if type(src) isnt "array"

    @_ignorePersist = true

    # fix issue when removing items within an array
    src  = src
    src2 = src.concat()
    esrc = @source().concat()
    
    # update existing
    for existingItem in esrc
      for newItem, i in src
        if @_compare existingItem, newItem
          if @field.options.ref
            existingItem.set newItem
            src.splice i, 1
          break

    # remove old item
    for existingItem, i in esrc
      found = false
      for newItem in src2
        if @_compare existingItem, newItem
          found = true
          break

      unless found
        @splice i, 1




    # insert the reset
    @push(item) for item in src


    @_ignorePersist = false

  ###
  ###

  _compare: (a, b) ->
    unless @field.options.ref
      return a is b
    else
      aid = a.get("_id")
      return (aid is b._id) or (aid is b)

  ###
  ###

  toJSON: () ->
    models = []
    for model in @source()
      models.push if model.__isModel then model.toJSON() else model

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