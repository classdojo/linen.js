APIMapper = require "./mapper"
Path      = require "./path"
mannequin = require "mannequin"
isa = require "isa"


class Linen

  ###
  ###

  constructor: (options = {}) ->
    @host = options.host
    @_routes = {}
    @_schemaDictionary = mannequin.dictionary()

  ###
   registers, or fetches a schema
  ###

  schema: (name, options) ->


    # only one argument?
    if arguments.length is 1  

      # is the name still a string? return the schema def
      if isa.string name
        return @_schemaDictionary.getSchema name

      # otherwise it's an object
      options = name
      for name of options
        @schema name, options[name]
      return

    @_schemaDictionary.register name, options
    @

  ###
   Maps the response for an API endpoint
  ###

  mapResponse: (mapper) ->
    return @_mapResponse if not arguments.length
    @_mapResponse = mapper
    @

  ###
  ###

  route: (options = {}) -> new Path @, options




