###
 address: {
  $ref: "address"
 }
###

class ReferenceMapper extends require("./base")

  ###
  ###

  constructor: (field, @_partOfCollection = false) ->
    super field
    
  ###
  ###

  map: (model, data) ->
    return unless data

    if data.__isModel
      if data.schema.name isnt @field.options.ref
        throw new Error "cannot assign model type \"#{data.schema.name}\" to field \"#{@field.path}\" type \"#{@field.options.ref}\""

      refModel = data

    # bleh - this is kind of nasty - there shouldn't be a check like this..
    else if not @_partOfCollection and (refModel = model.get(@field.path))
      refModel.reset data
    else
      refModel = @field.root.service.model(@field.options.ref, data, { owner: model })

    refModel.cache()
    refModel

  ###
  ###

  normalize: (model) -> model.get(@field.path + "._id")

  ###
  ###

  @test: (field) -> 
    field.options.ref


module.exports = ReferenceMapper