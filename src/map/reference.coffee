type = require "type-component"

class ReferenceMap extends require("./base")
  
  ###
  ###

  constructor: (field) ->
    super field
    @_ref = field.options.ref

  ###
  ###

  map: (model, value) ->

    # undefined? don't cast the reference
    return unless value?

    # already a model? make sure it's the right type
    if value?.__isModel
      if value.schema.name isnt @_ref
        throw new Error "cannot set model type \"#{value.schema.name}\" on \"#{@_ref}\""
      return value

    # otherwise cast the value as a model
    refModel = @field.linen.model @_ref, value

    refModel.owner = model

    return refModel


module.exports = ReferenceMap