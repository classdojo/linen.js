bindable = require "bindable"
Payload  = require "./payload"

class Model extends bindable.Object 

  ###
  ###

  __isModel: true

  ###
  ###

  constructor: (@schema, data = {}) ->
    super data
    @_changed = unless data._id then Object.keys(@_clone(data)) else []

  ###
  ###

  isNew: () -> not @has "_id"

  ###
  ###

  changed: () -> !!@_changed.length

  ###
  ###

  changedKeys: () -> @_changed

  ###
  ###

  flushChangedKeys: () ->
    ch = @_changed
    @_changed = []
    ch

  ###
  ###

  _set: (key, value) ->

    unless ~@_changed.indexOf key
      @_changed.push key

    super key, value

  ###
  ###

  save: (next = () ->)  -> @schema.save new Payload(@), next

  ###
  ###

  bind: (property) ->
    binding = @bind arguments...
    @_fetch property
    binding

  ###
  ###

  validate: (next) -> 
    error = @schema.validate @
    if arguments.length is 1
      next error
    else
      return error

  ###
  ###

  _clone: (data) -> JSON.parse JSON.stringify data

  ###
   refreshes the model
  ###

  fetch: () -> @schema.fetch @

  ###
  ###

  _fetch: (property) -> @schema.fetch @, [property]

  

module.exports = Model