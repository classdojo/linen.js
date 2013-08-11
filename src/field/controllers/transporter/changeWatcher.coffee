class ChangeWatcher

  ###
  ###

  constructor: (model, field) ->
    model.on "change", @_onModelChange
    @_changes = {}

  ###
  ###

  stop: () ->
    @_ignore = true

  ###
  ###

  start: () ->
    @_ignore = false

  ###
  ###

  purge: () ->
    @_changes = {}

  ###
  ###

  changed: (path) ->
    for key of @_changes
      return true if key.indexOf(path) is 0
    return false

  ###
  ###

  _onModelChange: (key, value) =>
    return if @_ignore
    @_changes[key] = value

module.exports = ChangeWatcher
