bindable = require "bindable"

class Model extends bindable.Object

  ###
  ###

  constructor: (@schema) ->
    super()

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

  get: (key) -> 
    @schema.vget(@, key) ? super(key)

  ###
  ###

  _set: (key, value) ->
    super key, @schema.vset @, key, value

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