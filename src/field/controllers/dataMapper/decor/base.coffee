type = require "type-component"

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
      data = model.get(@field.path)
    else
      data = model.data

    return data unless type(data) is "object"

    JSON.parse JSON.stringify data

  ###
  ###

  prepareModel: (model, data) ->

    
module.exports = BaseMapper