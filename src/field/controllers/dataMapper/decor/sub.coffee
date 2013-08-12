class SubMapper extends require("./base")
  
  ###
  ###

  map: (model, data) ->  

    oldData = data 

    checkData = data or {} 

    if data
      hasNew = true
    else
      data = {}

    for field in @_fields 
      d = data[field.name]  = field._mapper.map model, checkData[field.name] ? model.get(field.path)
      hasNew = hasNew or d?


    return oldData unless hasNew

    data

  ###
  ###

  normalize: (model, data = {}) -> 
    @_normalizeChildFields(model, data)


  ###
  ###

  _normalizeChildFields: (model, data) ->
    return data unless @_fields.length
    unless data
      data = {}
    for field in @_fields
      data[field.name] = field._mapper.normalize(model)
    data

  ###
  ###

  @test: (field) -> !!field.fields.length

module.exports = SubMapper