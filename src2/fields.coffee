hoist = require "hoist"
type  = require "type-component"

class Field
  
  ###
  ###

  constructor: (@property, options, @fields) -> 
    @_parseOptions options 

  ###
  ###

  _parseField: () ->

  ###
  ###

  validate: (value) ->



  ###
  ###

  map: (value) =>


  ###
  ###

  _parseOptions: (options) ->
    ops = {}

    if type(options) is "string"
      ops.$type = options




###
  
  validates 

  fields:
    name: "string"
    address: { $ref: "location" }
###

class Fields 
  
  ###
  ###

  constructor: (fields, @schema) ->

    @mapper   = schema.mapper
    @virtuals = schema.virtuals

    @_fields = []
    for fieldName of fields
      @_fields.push new Field fieldName, fields[fieldName], @

    @_initMaps()


  ###
  ###

  validate: (model) ->
    data = model.get()
    for field in @_fields
      field.validate 


  ###
  ###

  _initMaps: () ->

    # add the fields to the map
    for field in @_fields
      @mapper.add field.name, field.map






module.exports = Fields