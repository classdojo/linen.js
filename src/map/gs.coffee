type = require "type-component"

class GetterSetterMap extends require("./base")
  
  ###
  ###

  constructor: (field) ->
    super field

    @_get  = field.options.get or (model, value) -> value
    @_set  = field.options.set or () ->
    @_bind = field.options.bind or []

  ###
  ###

  map: (model, value) -> 

    _set = (value) ->

    _get = () ->



    if @_bind.length
      model.bind(@_bind.join(",")).to(_get)

    _get()


module.exports = GetterSetterMap