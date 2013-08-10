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

    newData = field._mapper.map model, oldData

    # if there are sub fields, then the data must be an object
    if field.numFields
      unless newData
        newData = {}
      unless oldData
        oldData = {}

    for childField in field.fields
      newData[childField.name] = @_mapField childField, model, oldData[childField.name]

    newData

  
  ###
  ###

  prepareModel: (model, data) ->

    model.reset = (data) =>
      newData = @map model, data
      model.set newData


    model.reset data


  ###
  ###

  _createFieldDecorator: (field) -> dataMapperFactory.create field


module.exports = (rootField) -> new DataMapFieldController rootField