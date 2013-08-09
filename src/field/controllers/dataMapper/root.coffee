

class RootMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field

  ###
  ###

  map: (model, data) -> @_mapFields @field, model, {}

  ###
  ###

  _mapFields: (field, model, newData) ->
    for field in field.fields
      newData[field.name] = field.controller.map model, newData[field.name]
      @_mapFields field, model, newData
    newData


  ###
  ###

  initializeModel: (model, data) ->

    # add a shim
    model.reset = (data) => 
      newData = @map model, data
      model.set newData

    # reset with raw data
    model.reset data

  ###
  ###

  @test: (field) -> not field.parent





module.exports = RootMapper