bindable = require "bindable"

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

  get: (key) -> 
    # fetch from super first, trigger the virtual get method
    # from the schema - note that virtual methods should only be set once
    super(key) ? @schema.vget(@, key)

  ###
  ###

  #_set: (key, value) ->
  #  super key, @schema.vset @, key, value

  ###
  ###

  _watching: (property) ->
    @get(property)
    
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