
module.exports = class

  ###
  ###

  constructor: (@route, @routeClass) ->
    @_routes = {}

  ###
  ###

  get: (singularName, pluralName) -> 

    if not (route = @_routes[singularName])
      route = @_routes[singularName] = new @routeClass({ singularName: singularName, pluralName: pluralName, parent: @route, root: @route.root or @route })

    route
