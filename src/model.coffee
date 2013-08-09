bindable = require "bindable"


class Model extends bindable.Object

  ###
  ###

  _watching: (property) ->
    @emit "watching", property

module.exports = Model