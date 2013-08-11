
###
  field: {
    $map: (value) -> String(value).toUpperCase()
  }
###

class FnMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_map = field.options.map

  ###
  ###

  map: (model, data) -> 
    data = @_map.call model, data
    

  ###
  ###

  @test: (field) ->
    !!field.options.map

module.exports = FnMapper