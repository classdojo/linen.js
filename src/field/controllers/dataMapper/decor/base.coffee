class BaseMapper 
  
  ###
  ###

  constructor: (@field) -> 
    @_fields = field.fields

  ###
  ###

  map: (model, data) -> 
    @_mapChildFields(model, data)

  ###
  ###

  _mapChildFields: (model, oldData, newData) ->   

    checkData = oldData or {} 

    if newData
      hasNew = true
    else
      newData = {}

    for field in @_fields 
      d = newData[field.name]  = field._mapper.map model, checkData[field.name] ? model.get(field.path)
      hasNew = hasNew or d?

    return oldData unless hasNew

    newData




  ###

  _mapFields: (field, model, oldData) ->

    newData = field._mapper.map model, oldData ? model.get(field.path)

    # if there are sub fields, then the data must be an object
    if field.numFields
      hasData = newData
      unless newData
        newData = {}
      unless oldData
        oldData = {}
    else
      hasData = true

    for childField in field.fields
      d = newData[childField.name] = @_mapField childField, model, oldData[childField.name]
      hasData = hasData or d?

    if hasData then newData else undefined
  ###

  ###
  ###

  normalize: (model) -> 
    @_normalizeChildFields(model, model.get(@field.path))


  ###
  ###

  _normalizeChildFields: (model, data) ->
    return data unless @_fields.length
    unless data
      data = {}
    for field in @_fields
      data[field.name] = field._mapper.normalize model
    data


  ###
  ###

  prepareModel: (model, data) ->

    
module.exports = BaseMapper