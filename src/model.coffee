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
    @refresh [property]

  ###
  ###

  refresh: (properties) -> 
    @schema.refresh @, toarray properties
    
  ###
  ###

  isNew: () -> return not @get "_id"

  ###
  ###

  fetch: (next) -> @schema.fetch @

  ###
  ###

  validate: (next) -> @schema.validate @

  ###
  ###

  save: (next) -> @schema.save @


module.exports = Model;