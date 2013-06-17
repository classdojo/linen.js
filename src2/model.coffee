bindable = require "bindable"
_ = require "underscore"

class Model extends bindable.Object

  ###
  ###

  constructor: (@schema, data = {}) ->
    super data

    # id exists? 
    @_changedValues = if data._id then {} else data

  ###
  ###

  isNew: () -> !@get "_id"

  ###
   validates the values in the model
  ###

  validate: (callback) -> @schema.validate @, callback

  ###
   returns a virtual value, or something stored in the model
  ###

  get: (key) ->
    return super() unless arguments.length
    if @schema.virtuals.hasGetter(key)
      return @schema.virtuals.get(@, key)
    else
      return super key

  ###
   sets a value to a virtual property
  ###

  _set: (key, value) ->
    if @schema.virtuals.hasSetter(key)
      return @schema.virtuals.set(@, key, value)
    else
      value = @schema.mapper.map key, value
      @_changedValues[key] = value
      return super key, value

  ###
   returns the changed values in this model
  ###

  changes: () -> @_changedValues

  ###
   returns the changed values, and resets them
  ###

  flushChanges: () ->
    changed = @_changedValues
    @_changedValues = {}
    JSON.parse JSON.stringify changed

  ###
   saves the model
  ###

  save: (callback) -> @schema.save @, callback

  ###
   deletes the model
  ###

  del: (callback) -> @schema.del @, callback

  ###
  ###

  remove: (callback) -> 
    @del @, (err) =>
      return callback(err) if err?
      @emit "remove"


  ###
   refreshes the model
  ###

  fetch: (callback) -> @schema.fetch @, callback

module.exports = Model


