EventEmitter = require("events").EventEmitter
Routes = require("./")

module.exports = class extends EventEmitter

  ###
  ###

  constructor: (options = {}) ->
    super()

    @parent  = options.parent
    @root    = options.root
    @_routes = new Routes @, @routeClass()

    @_optional = ["transport", "host", "mapResponse", "mapRequestOptions", "mapCollectionResult", "mapItemResult", "mapItemResponse"]
    @_setOptionMethod property for property in @_optional
    @_setDefaults options

  ###
  ###

  routeClass: () ->
    # OVERRIDE ME


  ###
  ###

  route: (singularName, pluralName) -> @_routes.get singularName, pluralName

  ###
  ###

  options: (options) ->
    for property in @_optional
      continue if not (value = options[property])
      @[property].call @, value

  ###
  ###

  _setDefaults: () -> 
    # OVERRIDE ME

  ###
  ###

  _setOptionMethod: (property) ->
    priv = "_#{property}"
    @[property] = (value) ->
      return @[priv] or @parent?[property]() if not arguments.length
      @[priv] = value
      return @





