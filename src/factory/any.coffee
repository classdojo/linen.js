factoryFactory = require "./factory"

class AnyFactory extends require("./base")

  ###
  ###

  constructor: (factories = []) ->
    @factories = factories.map factoryFactory.create

  ###
  ###

  test: (data) -> !!@_getFactory data

  ###
  ###

  create: (data) -> @_getFactory(data)?.create data

  ###
  ###

  _getFactory: (data) ->
    for factory in @factories
      return factory if factory.test(data)


module.exports = AnyFactory