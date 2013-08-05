class FnMapper extends require("./base")

  ###
  ###

  map: (model, value) ->
    @field.options.map.call model, value

module.exports = FnMapper
