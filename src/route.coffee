_ = require "underscore"
toarray = require "toarray"
path = require "path"

module.exports = class Route

  ###
  ###

  constructor: (@options, @parent = null, name = "") ->

    @root       = parent?.root or parent or @
    @ref        = options.ref
    @schemaName = options.schema

    # the path to this route
    @_path = options.path or name
    @name  = name

    # sub routes
    @_routes = {}


    # register the sub routes
    for route of options.routes
      @_routes[route] = new Route options.routes[route], @, route


    @_addMethod property for property in ["mapRequestOptions", "mapResponse", "mapCollection", "mapItem", "mapItemPath", "mapCollectionPath"]

  ###
  ###

  route: (path = "") -> 

    # deep search for a route
    pathParts = path.split(".")
    current = @
    for part in pathParts
      if not current
        throw new Error "canot find route for #{path}"
      current = current._routes[part] 
    current

  ###
  ###

  request: (options, next) ->


  ###
  ###

  path: (options) ->



    pathParts = [@parent?.path(options) or ""]

    # reference to another route
    if @ref
      ref = @root.route @ref

    # check THIS schema name, or check the reference schema name.
    item = options[@schemaName or ref?.schemaName]

    # if the reference exists, AND the item exists, then use the referenced
    # route to create the path.
    if ref and item
      return ref.path options

    if item
      pathParts.push @_option("mapItemPath").call @, item
    else
      pathParts.push @_option("mapCollectionPath").call @, item


    path.normalize pathParts.join "/"

  ###
  ###

  _option: (property) -> 
    @options[property] or @parent?._option(property)

  ###
  ###

  _addMethod: (property) ->
    @[property] = () -> @_option(property).apply @, arguments




module.exports = class extends Route

  ###
  ###

  constructor: (options = {}) ->
    _.defaults options, {
      mapRequestOptions: @_defaultRouteRequestOptions,
      mapResponse: @_defaultRouteResponse,
      mapCollection: @_defaultRouteCollection,
      mapItem: @_defaultRouteItem,
      mapItemPath: @_mapDefaultItemPath,
      mapCollectionPath: @_mapDefaultCollectionPath,
    }


    super options

  ###
  ###

  _defaultRouteResponse: (response, next) =>

    if response.error
      return next response.error

    next null, response.result or response

  ###
  ###

  _defaultRouteCollection: (result) => toarray result

  ###
  ###

  _defaultRouteItem: (result) => toarray(result).shift()

  ###
  ###

  _mapDefaultItemPath: (item) -> [@_path, item].join("/")

  ###
  ###

  _mapDefaultCollectionPath: () -> @_path






