bindable = require "bindable"
type     = require "type-component"

class Model extends bindable.Object
  
  ###
  ###

  __isModel: true

  ###
  ###

  constructor: (@schema, data = {}) ->
    super data
    @_changes = {}

    # keep tabs on the changed values
    @on "change", @_onChange

  ###
  ###

  reset: (data) ->
    @set data
    @changed = []

  ###
  ###

  _watching: (property) ->  
    @schema.loadField @, property, () ->

  ###
   returns TRUE if the _id is not present
  ###

  isNew: () -> return @schema.isNew @

  ###
   validates whether the model is valid
  ###

  validate: (next = () ->) -> @schema.validate @, next

  ###
   reloads the model from the server
  ###

  load: (next) -> @schema.load @, next

  ###
  ###

  loadField: (fieldName, next) -> @schema.loadField @, fieldName, next

  ###
  ###

  save: (next) -> @schema.save @, next

  ###
  ###

  remove: (next) -> @schema.remove @, next

  ###
  ###

  toObject: () -> @toJSON()

  ###
  ###

  toJSON: () -> @schema.toJSON @

  ###
  ###

  _flushChanges: () ->
    c = @_changes
    @_changes = {}
    c

  ###
   called whenever a property changes on the model - used
   for persisting data to the server
  ###

  _onChange: (key) ->
    @_changes[key] = 1

module.exports = Model;