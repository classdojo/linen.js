###

happens when a field doesn't have a request option, but the 
parent might.

###

class InheritTransport extends require("./base")

  ###
  ###

  request: (payload, next) ->
    @field.parent._transporter.request payload, next

  ###
  ###

  @test: (field) -> field.parent


module.exports = InheritTransport

