class ChangeWatcher

  ###
  ###

  constructor: (@model) ->
    @_values = {}

  ###
  ###

  hasChanged: (fieldName) -> 
    @_values[fieldName] isnt @model.get(fieldName)

  ###
  ###

  change: (fieldName) ->
    return false unless @hasChanged(fieldName)
    @_values[fieldName] = @model.get(fieldName)
    return true


module.exports = ChangeWatcher
