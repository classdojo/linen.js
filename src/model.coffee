bindable = require "bindable"


class Model extends bindable.Object
  
  ###
  ###

  __isModel: true
  
  ###
  ###

  constructor: (@schema) -> 
    super()

  ###
  ###

  _watching: (property) ->
    @emit "watching", property

module.exports = Model