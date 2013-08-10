validator  = require "../validator"
dataMapper = require "../dataMapper"
type       = require "type-component"

###
 transports the model data to / from a server - restful
###

class Transporter extends require("../base")

  ###
  ###

  name: "transporter"

  ###
  ###

  constructor: (rootField) ->
    super rootField
    @_validator  = validator rootField
    @_dataMapper = dataMapper rootField

  ###
  ###

  prepareModel: (model, data) ->

    if type(data) is "string"
      data = { _id: data }

    @_validator.prepareModel model, data
    @_dataMapper.prepareModel model, data

  ###
  ###

  map: (model, data) -> @_dataMapper.map model, data

  ###
  ###

  load: (model, next) ->

  ###
  ###

  save: (model, next) -> 
    @validate model, (err, next) ->

  ###
  ###

  validate: (model, next) -> @_validator.validate model, next


module.exports = (field) -> new Transporter field