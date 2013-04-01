toarray = require "toarray"
outcome = require "outcome"
verify  = require("verify")()


module.exports = class
  
  ###
  ###

  constructor: (options, @linen) ->

    @transport      = options.transport
    @host           = options.host


    @_mapPath       = options.mapPath       or @_defaultMapPath
    @_mapResponse   = options.mapResponse   or @_defaultMapResponse
    @_mapItem       = options.mapItem       or @_defaultMapItem
    @_mapCollection = options.mapCollection or @_defaultMapCollection

  ###
  ###

  request: (options, callback) ->

    if not verify.that(options).onError(callback).has("item", "method").success
      return


    # spell out what params can be used in the request. 

    method = options.method        # GET, DELETE, PUT, POST
    item   = options.item          # people.friends
    params = options.params or {}  # used for the path
    query  = options.query or {}   # used for GET query data
    data   = options.content or {} # used for POST data
    one    = options.one or false  # return ONE item

    # map the restful interface
    path = @_mapPath { method: method, item: item, params: params }

    o = outcome.e callback


    # make the request
    @transport.request { host: @host, path: path, method: method, query: query }, o.s (response) =>
      @_mapResponse response, o.s (result) =>

        if one
          callback null, @_mapItem result
        else
          callback null, @_mapCollection result

  ###
  ###

  _defaultMapResponse: (response, next) ->


    if response.error or response.errors
      return next response.errors?[0] or response.error

    next null, response.result or response


  ###
  ###

  _defaultMapItem: (result) -> toarray(result).shift()

  ###
  ###

  _defaultMapCollection: (result) -> toarray(result)

  ###
   maps a restful path
  ###

  _defaultMapPath: (options) -> 

    paths = @_mapPathPart options.item, [], true
    paths = paths.reverse()

    return paths.join "/"


  ###
  ###

  _mapPathPart: (currentItem, paths, root) -> 

    croute = currentItem.route()

    # if the item is a collection, AND it's the first to be mapped, then add the collection name
    # e.g: people/craig/friends
    if root and currentItem.__isCollection
      paths.push croute.collectionName
    else

      if _id = currentItem.get "_id"
        paths.push _id

      # inherit the paths? something like people/craig/friends/sam
      if croute.inherit is true
        paths.push croute.collectionName

      # don't inherit the path? something like people/craig/friends -> /people/sam
      else
        # add the collection name
        paths.push croute.path
        return paths


    currentItem = currentItem.parent

    # skip collections
    if currentItem and currentItem.__isCollection
      currentItem = currentItem.parent

    return paths if not currentItem

    @_mapPathPart currentItem, paths, false




