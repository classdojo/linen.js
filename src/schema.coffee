bindable = require "bindable"
Model    = require "./model"
type     = require "type-component"

class Schema extends bindable.Object

  ###
  ###

  constructor: (@linen, @name, @definition) ->
    @_parseDefinition definition

  ###
  ###

  model: (data) -> @map data

    

  ###
  ###

  map: (data) ->

    # is a string? must be an id
    if type(data) is "string"
      data = { _id: data }

    # setup the model
    model = new Model @

    # setup the virtual methods
    for key of @_methods
      model[key] = @_methods[key]

    # resets the data without triggering persistence
    model.reset data

    model


  ###
    model.get(k)
  ###

  vget: (model, key) -> @get(key)?.value(model)

  ###
  ###

  value: (model) -> 

  ###
  ###

  default: (model) -> 
 
  ###
    model.set(k, v)
  ###

  vset: (model, key, value) -> 
    @get(key)?.map(value) ? value

  ###
    model.fetch() OR when a property is listened to
  ###

  fetch: (model, key = undefined) ->

  ###
  ###

  validate: (model, next) ->


  ###
   called when PUT or POST
  ###

  save: (model, next) ->

  ###
  ###

  _parseDefinition: (definition) -> 

    ops = {}

    # type provided
    if type(definition) == "string"
      ops.type = definition

    # dollar sign - explicit ops
    else if @_isOps definition
      ops = @_cleanOps definition

    # otherwise they're just fields
    else
      ops.fields = definition

    # add the child schemas
    for key of ops.fields  
      @set key, @_parseField property, definition.fields

  ###
  ###

  _parseField: (property, field) ->
    @set property, new Schema @linen, property, field

  ###
  ###

  _isOps: (ops) ->
    for key of ops
      return true if key.substr(0, 1) is "$"
    return false

  ###
  ###

  _cleanOps: (ops) ->
    nops = {}
    for key of ops
      nops[key.substr(0, 1)] = key
    nops



module.exports = Schema