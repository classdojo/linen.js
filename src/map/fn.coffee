class FnMapper

  ###
  ###

  constructor: (@field) ->

  ###
  ###

  map: (model, value) ->
    @field.options.map.call model, value

  ###
  ###

  toObject: (model, value) -> value

module.exports = FnMapper
