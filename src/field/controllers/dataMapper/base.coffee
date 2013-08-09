class BaseMapper 
  
  ###
  ###

  constructor: (@field) -> 
    @_fields = field.fields

  ###
  ###

  _map: () ->

  ###
  ###

  initializeModel: (model, data) ->
    
module.exports = BaseMapper