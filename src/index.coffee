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
    @_schemas[name] = schema(definition, name)

  ###
  ###

  model: (name, data, options) -> 
    @_schemas[name].model(name)

  ###
  ###

  collection: (name, options) ->
    @_schemas[name].collection(name)

###
###

module.exports = () -> new Service()
module.exports.schema = schema