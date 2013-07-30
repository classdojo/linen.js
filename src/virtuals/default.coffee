type = require "type-component"

class DefaultMapper extends require("./base")

  ###
  ###

  constructor: (schema) ->
    super schema
    @_createDefault = @_getDefaultFn schema.options.default
  
  ###
  ###

  get: (model, value) -> value ? @_createDefault()

  ###
  ###

  _getDefaultFn: (def) ->
    if type(def) is "function"
      return def
    return () -> def

  ###
  ###

  @test: (schema) -> schema.options.default

module.exports = DefaultMapper