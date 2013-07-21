Schema = require "./schema"

class Linen 

  ###
  ###

  constructor: () ->
    @_schemas = { }

  ###
  ###

  model: (name, data) ->

    unless @_schemas[name]
      throw new Error "schema '#{name}' does not exist"

    @_schemas[name].model data

  ###
  ###

  register: (name, definition) ->
    @_schemas[name] = new Schema @, name, definition



module.exports = () -> new Linen()
