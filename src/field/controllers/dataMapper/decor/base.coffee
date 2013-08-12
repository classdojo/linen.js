class BaseMapper 
  
  ###
  ###

  constructor: (@field) -> 
    @_fields = field.fields


  ###
  ###

  map: (model, data) -> data

  ###
  ###

  normalize: (model) -> 
    if @field.parent
      return model.get(@field.path)
    return model.data

  ###
  ###

  prepareModel: (model, data) ->

    
module.exports = BaseMapper