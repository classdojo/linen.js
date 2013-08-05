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
      kp = key.split(".") 
      k = kp.shift()
      continue if ~keys.indexOf(k)
      keys.push k
    @_changes = {}
    return keys


module.exports = ChangeWatcher
