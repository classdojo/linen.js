class FnMapper

  ###
  ###

  constructor: (@field) ->

  ###
  ###

  map: (model, value) ->
    @field.options.map.call model, value

module.exports = FnMapper
