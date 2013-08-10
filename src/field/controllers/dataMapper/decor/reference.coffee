###
 address: {
  $ref: "address"
 }
###

class ReferenceMapper extends require("./base")
    
  ###
  ###

  map: (model, data) ->
    return unless data

    if data.__isModel
      if data.schema.name isnt @field.options.ref
        throw new Error "cannot assign model type \"#{data.schema.name}\" to field \"#{@field.path}\" type \"#{@field.options.ref}\""

      refModel = data
    else
      refModel = @field.root.service.model(@field.options.ref, data)

    refModel


  ###
  ###

  @test: (field) -> 
    field.options.ref


module.exports = ReferenceMapper