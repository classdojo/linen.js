toarray = require "toarray"
outcome = require "outcome"
async   = require "async"


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

    # throttle the number of simultaneous requests
    @_cargo         = async.queue @_request, Math.max 3, options.requestLimit or 10

  ###
  ###

  request: (options, callback) ->
    @_cargo.push options, callback

    
  ###
  ###

  _request: (options, callback) =>
    # spell out what params can be used in the request. 

    method     = options.method        # GET, DELETE, PUT, POST
    item       = options.item          # people.friends
    collection = options.collection    # the collection to remove the item from
    params     = options.params or {}  # used for the path
    query      = options.query  or {}  # used for GET query data
    body       = JSON.parse JSON.stringify options.body   or {}  # used for POST data
    one        = options.one

    # map the restful interface
    path = @_mapPath { method: method, item: item, params: params, collection: collection }

    o = outcome.e callback


    # make the request
    @transport.request { host: @host, path: path, method: method, query: query, body: body }, o.s (response) =>
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

    paths = []

    # collection might not exist - this happens when a model parent is another model
    if options.collection
      @_mapPathPart options.collection, options, paths, true

      if options.item
        paths.unshift options.item.get "_id"

    else if options.item
      @_mapPathPart options.item, options, paths, true


    paths = paths.reverse()

    return paths.join "/"


  ###
   TODO - separate collection from item
  ###

  _mapPathPart: (currentItem, options, paths, root) -> 

    return paths if not currentItem

    croute = currentItem.route()

    if currentItem.__isCollection

      # is the collection being fetched? might be something like people/craig/friends
      if root
        paths.push croute.collectionName


      # otherwise skip the collection
      else
        return @_mapPathPart currentItem.parent, options, paths

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

    @_mapPathPart currentItem, options, paths, false



