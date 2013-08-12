
###
  createdAt: {
    $default: Date.now
  }
###

class CastMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_cast = @_caster field.options.type

  ###
  ###

  map: (model, data) -> 
    return undefined unless data?
    @_cast data

  ###
  ###

  _caster: (type) ->

    if type is "string"
      return (value) -> String(value)

    if type is "number"
      return (value) -> Number(value)

    if type is "boolean"
      return (value) -> !!value

    return (value) -> value

  ###
  ###

  @test: (field) -> 
    !!field.options.type


module.exports = CastMapper