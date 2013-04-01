
outcome = require "outcome"
BaseRoute = require "./base"
_ = require "underscore"

module.exports = class Route extends BaseRoute

  ###
  ###

  constructor: (options = {}) ->

    super options

    # name of this route so other routes can reference it
    @name        = options.pluralName or options.singularName

    # schema for the result items. Needed for updating each item
    @schema      = @root.schema options.singularName

    # plugins together the schema & adds methods to the model class
    @_modelPlugin = @schema.modelPlugin


    # used for flow-control for errors
    @_o          = outcome.e @

    @_setDefaults()

  ###
  ###

  routeClass: () -> Route

  ###
  ###

  item: (requestOptions) -> @_modelPlugin.createItem @, requestOptions

  ###
  ###

  collection: (requestOptions) -> @_modelPlugin.createCollection @, requestOptions

  ###
  ###

  fetch: (options, callback) ->

    #1. map the url
    #2. map the response
    #3. fetch the data
    #4. map the response



    requestOptions = @_mapRequestOptions options

    @_request requestOptions, @_o.e(callback).s (result) =>

      if options.item
        result = @mapItemResult() result
      else
        result = @mapCollectionResult() result

      callback null, result

  ###
  ###

  _request: (options, callback) ->
    @transport().request options, @_o.e(callback).s (response) =>
      @mapResponse() response, callback


  ###
  ###

  _setDefaults: () ->

    #
    @mapRequestOptions (options) =>

      ro = options.item.requestOptions

      # first get the collection pat
      parentOptions = @parent._mapRequestOptions({ item: options.item.parent })

      parts = parentOptions.urlParts.concat @name

      # if the item exists, then add that to the url parts
      if ro.itemId
        parts.push ro.itemId

      # join the path

      path = parts.join("/")

      {
        host: @host(),
        method: options.method,
        data: options.data,
        urlParts: parts,
        path: path,
        collection: @name,
        url: @host() + "/" + path,
        itemId: ro.itemId,
        query: _.extend({}, parentOptions.query or {}, ro.query or {})
      }




