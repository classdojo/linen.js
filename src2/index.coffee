Schema = require "./schema"

class Linen
  

  ###
  ###

  constructor: () ->
    @_schemas = {}


  ###
  ###

  schema: (name, definition) ->
    return @_schemas[name] if arguments.length is 1
    @_schemas[name] = new Schema @, definition


module.exports = () -> 
  new Linen()