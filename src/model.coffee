bindable = require "bindable"
type     = require "type-component"
toarray  = require "toarray"

class Model extends bindable.Object

  ###
  ###

  constructor: (@schema) ->
    super()
    @_vgetting = {}

  ###
   called when a property is being watched on this model
  ###

  _watching: (property) ->
    @schema.fetch @, property

  ###
  ###

  reset: (data) ->
    @set data
    @changed = []

  ###
  ###

  _watching: (property) ->
    @schema.fetchField @, property

  ###
   fills the model in with *all* virtuals
  ###

  fetchAll: (next) ->
    @schema.fetchAll @, next

  ###
  ###

  fetch: (next) ->
    @schema.fetch @, next
    
  ###
   returns TRUE if the _id is not present
  ###

  isNew: () -> return not @get "_id"

  ###
  ###

  validate: (next) -> @schema.validate @

  ###
  ###

  save: (next) -> @schema.save @


module.exports = Model;