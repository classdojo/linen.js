schema = require "./schema"

class Service

  ###
  ###

  constructor: () ->
    @_schemas = {}

  ###
   registers a new schema
  ###

  schema: (name, definition) ->
    @_schemas[name] = schema(definition, name, @)

  ###
  ###

  model: (name, data, options) -> 
    @_schema(name).model(data, options)

  ###
  ###

  collection: (name, options) ->
    @_schema(name).collection(options)

  ###
  ###

  _schema: (name) -> 
    unless s = @_schemas[name]
      throw new Error "schema \"#{name}\" doesn't exist"
    s


###
###

module.exports = () -> new Service()
module.exports.schema = schema