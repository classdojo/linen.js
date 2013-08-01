ClassFactory = require "./clazz"

class Factory extends require("./base")

  
  ###
  ###

  constructor: (factoriesOrClasses...) ->

    @_factories = factoriesOrClasses.map (clazz) ->
      return clazz if clazz.__isFactory
      return new ClassFactory clazz

module.exports = Factory