type = require "type-component"

class FnValidator

  ###
  ###

  validate: (value, next) ->
    @_tester value, next
  
  ###
  ###

  @test: (options) -> type(options) is "function"

module.exports = FnValidator