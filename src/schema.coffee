type      = require "type-component"
parser    = require "./fieldParser"
Model     = require "./model"
flatstack = require "flatstack"

class Schema
  
  ###
  ###

  constructor: (@linen, options = {}) ->
    @name   = options.name
    @_fetch = options.fetch
    @fields = parser.parse @, options.fields

  ###
  ###

  isVirtual: () -> !!@_fetch

  ###
  ###

  model: (data) ->
    d = {}

    if type(data) is "string"
      d._id = data
    else
      d = data or {}


    # return the new model, along with the
    # correct, mapped data
    m = new Model @
    m.reset @fields.map d

    unless m.isNew()
      m.flushChanged()

    m


  ###
  ###

  validate: (model) -> 
    @fields.validate model

  ###
  ###

  save: (payload, next) -> 

    callstack = flatstack()

    # filter out the keys which are NOT virtual
    usableKeys = payload.keys.filter (key) =>
      not @fields.get(key).isVirtual()


    if @_fetch and (payload.model.isNew() or usableKeys.length)
      callstack.push (next) =>
        @_fetch { method: (if payload.model.isNew() then "POST" else "PUT"), model: payload.model, data: payload.data(usableKeys) }, next


    callstack.push (next2) =>
      # first save the virtual fields
      @fields.save payload, (err) =>
        return next(err) if err?
        next2()


    callstack.push () -> next()

  ###
  ###

  fill: (model, properties) ->

    unless properties
      properties = @fields.names()

    for property in properties
      field = @fields.get property
      field?.fetch model

  ###
  ###

  del: (model, next) ->
    @_fetch { method: "DELETE", model: model }, next


module.exports = Schema