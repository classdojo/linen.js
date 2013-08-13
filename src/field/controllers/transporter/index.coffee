validator      = require "../validator"
dataMapper     = require "../dataMapper"
type           = require "type-component"
async          = require "async"
MemoDictionary = require "./memoize/dictionary"
transporterFactory = require "./decor/factory"
Cache = require "./cache"

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

  prepareModel: (model, data, options = {}) ->

    if type(data) is "string"
      data = { _id: data }


    @_validator.prepareModel model, data, options
    @_dataMapper.prepareModel model, data, options

    model._memos = new MemoDictionary()
    model._cache = new Cache model, data

    model.load   = (next) => @load model, next

    # support for old libs
    model.fetch   = (next) => @load model, next
    model.reload = (next) => @reload model, next
    model.save   = (next) => @save model, next
    model.remove = (next) => @remove model, next

    if @rootField.options.methods
      for methodName of @rootField.options.methods
        model[methodName] = @rootField.options.methods[methodName]

    # fetch a field if it's being watched
    model._watching = (property) =>

      # defer to the field
      @rootField.getField(property, true)?._transporter.watching { model: model, method: "get", property: property }, () ->

  ###
  ###

  map: (model, data) -> @_dataMapper.map model, data

  ###
  ###

  normalize: (model, data) -> @_dataMapper.normalize model, data

  ###
  ###

  load: (model, next) -> 
    @_request { model: model, method: "get" }, next

  ###
  ###

  reload: (model, next) ->
    @_request { model: model, method: "get", hash: Date.now() }, next

  ###
  ###

  save: (model, next = () ->) -> 
    @validate model, (err) =>
      return next(err) if err?
      @_request { model: model, method: "set" }, (err) ->
        return next(err) if err?
        model.emit "save"
        next()

  ###
  ###

  remove: (model, next = () ->) ->
     @_request { model: model, method: "del" }, (err) ->
      return next(err) if err?
      model.emit "remove"
      next()
      
  ###
  ###

  _request: (options, next = () ->) ->
    async.forEach @_decorators, ((decor, next) ->
      decor.request options, next 
    ), next

  ###
  ###

  validate: (model, next = () ->) -> @_validator.validate model, next

  ###
  ###

  _createFieldDecorator: (field) -> transporterFactory.create field


module.exports = (field) -> new Transporter field