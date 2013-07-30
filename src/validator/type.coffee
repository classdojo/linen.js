type = require "type-component"

class TypeValidator

  ###
  ###

  constructor: (options) ->
    @type = options.type
    @message = options.message or "must be a #{@type}"

  ###
  ###

  validate: (value, next) -> 
    unless type(value) is @type
      next new Error @message
    else
      next()

  ###
  ###

  @test: (options) -> !!options.type

module.exports = TypeValidator