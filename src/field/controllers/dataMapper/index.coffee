dataMapperFactory = require './decor/factory'

class DataMapFieldController extends require("../base")

  ###
  ###

  name: "mapper"

  ###
  ###

  map: (model, data) ->
    @_mapField @rootField, model, data

  ###
  ###

  _mapField: (field, model, oldData) ->

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

  _mapPath: (path, model, oldData) ->

    if not path or path.length is 0
      field = @rootField
    else
      field = @rootField.getField path

    @_mapField field, model, oldData


  
  ###
  ###

  prepareModel: (model, data) ->

    model.reset = (data, path = "") =>

      newData = @_mapPath path, model, data

      if path is ""
        model.set newData or {}
      else
        model.set path, newData

    for mapper in @_decorators
      mapper.prepareModel model, data

    model.reset data


  ###
  ###

  _createFieldDecorator: (field) -> dataMapperFactory.create field


module.exports = (rootField) -> new DataMapFieldController rootField