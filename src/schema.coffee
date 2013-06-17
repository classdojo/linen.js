type    = require "type-component"
parser  = require "./fieldParser"
Model   = require "./model"

class Schema
  
  ###
  ###

  constructor: (@linen, options = {}) ->
    @name = options.name
    @_fields = parser.parse @, options.fields


  model: (data) ->
    d = {}

    if type(data) is "string"
      d._id = data
    else
      d = data or {}


    # return the new model, along with the
    # correct, mapped data
    new Model @, @_fields.map d

  ###
  ###

  validate: (model) -> 
    @_fields.validate model

  ###
  ###

  save: (model, next) -> 

    # first save the virtual fields
    @_fields.save model, (err) =>
      return next(err) if err?
      console.log "SEV"


  ###
  ###

  fetch: (model, properties) ->

    unless properties
      properties = @_fields.names()

    for property in properties
      field = @_fields.get property
      field.fetch model


module.exports = Schema