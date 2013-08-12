class GroupMapper extends require("./base")

  ###
  ###

  constructor: (@field, @_mappers) ->

  ###
  ###

  map: (model, data) ->
    newData = data
    for mapper in @_mappers
      newData = mapper.map model, newData
    newData

  ###
  ###

  normalize: (model) ->
    for mapper in @_mappers
      data = mapper.normalize model, data
    data

module.exports = GroupMapper