type = require "type-component"

class DefaultMap
  
  ### 
  ###

  constructor: (@field) ->
    @_default = @_fixDefault field.options.default

  ###
  ###

  map: (model, value) -> 
    return value if not model.isNew()
    value ? @_default()

  ###
  ###

  _fixDefault: (def) ->
    if type(def) is "function"
      return def
    else
      return () -> def


module.exports = DefaultMap