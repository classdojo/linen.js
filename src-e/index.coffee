mannequin = require "mannequin"
BaseRoute = require "./routes/base"
Routes = require "./routes"
toarray = require "toarray"
Route = require "./routes/route"
ModelPlugin = require "./modelPlugin"

class Linen extends BaseRoute

  ###
  ###

  constructor: (options = {}) ->
    super options

    @schemas = mannequin.dictionary()


    if options.schemas
      @schema options.schemas



  ###
   returns a schema, or registers one, or many
  ###

  schema: (name, options) ->

    # one arg?
    if arguments.length is 1

      # name is an object? register multiple
      if typeof name is "object"
        options = name
        for key of options
          @schema key, options[key]
        return
      else
        return @schemas.getSchema name



    @schemas.register name, options
    new ModelPlugin @schemas.getSchema(name), @

  ###
  ###

  routeClass: () -> Route

  ###
  ###

  _setDefaults: (options) ->
    super options

    @transport options.transport
    @host options.host or (if (typeof window isnt "undefined") then ("#{window.location.protocol}//{window.location.host}") else "http://localhost")


    @mapRequestOptions () -> 
      {
        path: "/",
        urlParts: [],
        query: {}
      }

    #
    @mapResponse (response, callback) ->

      if response.error
        return callback response.error

      callback null, response.result or response

    #
    @mapItemResult (item) -> toarray(item).shift()

    #
    @mapCollectionResult (items) -> toarray items




###
###
module.exports = (options) -> new Linen options
