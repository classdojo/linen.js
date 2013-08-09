validator  = require "../validator"
dataMapper = require "../dataMapper"

###
 transports the model data to / from a server - restful
###

class Transporter extends require("../base")

  ###
  ###

  constructor: (field) ->
    super field
    @_validator  = validator field
    @_dataMapper = dataMapper field


  ###
  ###

  initializeModel: (model, data) ->
    @_validator.initializeModel model, data
    @_dataMapper.initializeModel model, data

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
      # SAVE


  ###
  ###

  validate: (model, next) ->
    @_validator.validate model, next


module.exports = (field) -> new Transporter field