bindable = require "bindable"
Payload  = require "./payload"

class Model extends bindable.Object 

  ###
  ###

  __isModel: true

  ###
  ###

  constructor: (@schema) ->
    super {}
    @_changed = {}
    @_bindFields()

  ###
  ###

  isNew: () -> not @has "_id"

  ###
  ###

  hasChanged: () -> !!Object.keys @_changed

  ###
  ###

  flushChanged: () ->
    ch = @_changed
    @_changed = {}
    changed = []
    for key of ch
      changed.push ch[key]
    changed

  ###
  ###

  save: (next = () ->)  -> @schema.save new Payload(@), next

  ###
  ###

  bind: (property) ->
    binding = super arguments...
    return binding if @_ignoreFetch
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

  ###
  ###

  _bindFields: () ->
    @_ignoreFetch = true
    for fieldName in @schema.fields.names() then do (fieldName) =>
      @bind(fieldName).to (newValue, oldValue) =>
        @_changed[fieldName] = { key: fieldName, nv: newValue, ov: oldValue }
    @_ignoreFetch = false

  

module.exports = Model