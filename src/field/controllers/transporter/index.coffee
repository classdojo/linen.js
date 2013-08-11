validator      = require "../validator"
dataMapper     = require "../dataMapper"
type           = require "type-component"
async          = require "async"
MemoDictionary = require "./memoize/dictionary"
transporterFactory = require "./decor/factory"

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

    model._memos = new MemoDictionary()
    model.load   = (next) => @load model, next
    model.save   = (next) => @save model, next

    # fetch a field if it's being watched
    model.on "watching", (property) =>

      # ignore load if the value exists
      return if model.get(property)?

      @rootField.getField(property, true)?._transporter.request { model: model, method: "get" }, () ->

  ###
  ###

  map: (model, data) -> @_dataMapper.map model, data

  ###
  ###

  load: (model, next) -> 
    @_request { model: model, method: "get" }, next

  ###
  ###

  save: (model, next) -> 
    @validate model, (err) =>
      return next(err) if err?
      @_request { model: model, method: "set" }, next
      
  ###
  ###

  _request: (options, next) ->
    async.forEach @_decorators, ((decor, next) ->
      decor.request options, next 
    ), next

  ###
  ###

  validate: (model, next) -> @_validator.validate model, next

  ###
  ###

  _createFieldDecorator: (field) -> transporterFactory.create field


module.exports = (field) -> new Transporter field