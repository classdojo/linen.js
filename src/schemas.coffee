Schema = require "./schema"
comerr = require "comerr"

class Schemas

  ###
  ###

  constructor: (@linen) ->
    @_schemas = {}

  ###
  ###

  add: (schemaOptions) ->

    # don't allow the same type of schema to be added
    if @_schemas[schemaOptions.name]
      throw new comerr.AlreadyExists "schema #{schemaOptions.name} already exists"

    @_schemas[schemaOptions.name] = new Schema @linen, schemaOptions

  ###
  ###

  get: (name) -> @_schemas[name]

  ###
  ###

  model: (name, options) -> @_vExists(name).model(options)

  ###
  ###

  collection: (name) -> @_vExists(name).collection()

  ###
  ###

  _vExists: (name) -> 
    unless schema = @_schemas[name]
      throw new comerr.NotFound "schema #{name} doesn't exist"

    schema

module.exports = Schemas