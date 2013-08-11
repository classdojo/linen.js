dataMapperFactory = require './decor/factory'

class DataMapFieldController extends require("../base")

  ###
  ###

  name: "mapper"

  ###
  ###

  map: (model, data) -> @rootField.map model, data


  ###
  ###

  _mapPath: (path, model, oldData) ->

    if not path or path.length is 0
      field = @rootField
    else
      field = @rootField.getField path

    field._mapper.map model, oldData


  
  ###
  ###

  prepareModel: (model, data) ->

    model.reset = (data, path = "") =>

      newData = @_mapPath path, model, data

      if path is ""
        model.set newData or {}
      else
        model.set path, newData

    model.normalize = () =>
      @rootField._mapper.normalize model


    for mapper in @_decorators
      mapper.prepareModel model, data

    model.reset data


  ###
  ###

  _createFieldDecorator: (field) -> dataMapperFactory.create field


module.exports = (rootField) -> new DataMapFieldController rootField