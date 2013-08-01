bindable = require "bindable"
type     = require "type-component"
toarray  = require "toarray"

class Model extends bindable.Object

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
    @schema.fetchField @, property

  ###
   fills the model in with *all* virtuals
  ###

  fetchAll: (next) ->
    @schema.fetchAll @, next

  ###
  ###

  fetchField: (name, next) -> 
    @schema.fetchField @, name, next

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