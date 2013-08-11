###

happens when a field doesn't have a request option, but the 
parent might.

###

class InheritTransport extends require("./base")

  ###
  ###

  request: (options, next) ->
    @field.parent._transporter.request options, next

  ###
  ###

  watching: (options) ->
    return if options.model.get options.property
    @request options

  ###
  ###

  @test: (field) -> field.parent


module.exports = InheritTransport

