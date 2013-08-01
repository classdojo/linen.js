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

    t = type(value)

    valid = t is @type

    # need to perform additional checks to make sure it's the correct type
    switch t
      when "number" then valid = valid and !isNaN(value)

    unless valid
      next new Error @message
    else
      next()

  ###
  ###

  @test: (options) -> !!options.type

module.exports = TypeValidator