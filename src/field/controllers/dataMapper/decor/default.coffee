type = require "type-component"

###
  createdAt: {
    $default: Date.now
  }
###

class DefaultMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_default = @_createDefault field.options.default

  ###
  ###

  map: (model, data) -> 
    data ? @_default.call model

  ###
  ###

  _createDefault: (def) ->
    if type(def) is "function"
      return def
    else
      return () -> def

  ###
  ###

  @test: (field) -> 
    field.options.default?


module.exports = DefaultMapper