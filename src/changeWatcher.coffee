dref = require "dref"

class ChangeWatcher

  ###
  ###

  constructor: (@model) ->
    @schema = @model.schema
    @model.on "change", @_onChange
    @_changes = {}

  ###
  ###

  _onChange: (key, value) =>
    @_changes[key] = 1

  ###
  ###

  flushChangedKeys: () -> 
    keys = []
    for key of @_changes
      keys.push key
    @_changes = {}
    return keys


module.exports = ChangeWatcher
