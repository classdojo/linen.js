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

  loadAllFields: (next) -> @schema.loadAll @, next

  ###
  ###

  save: (next) -> @schema.save @, next

  ###
  ###

  remove: (next) -> @schema.remove @, next

  ###
  ###

  toJSON: () -> @schema.toJSON @


module.exports = Model;