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

  initializeModel: (model, data) ->
    
module.exports = BaseMapper