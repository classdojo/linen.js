class BaseMapper 
  
  ###
  ###

  constructor: (@field) -> 
    @_fields = field.fields

  ###
  ###

  map: (model, data) -> 
    data

  ###
  ###

  prepareModel: (model, data) ->

    
module.exports = BaseMapper