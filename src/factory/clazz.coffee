class ClassFactory extends require("./base")

  ###
  ###

  constructor: (@_class) ->


  ###
  ###

  test: (options) -> @_class.test options

  ###
  ###

  create: (options) -> new @_class options


module.exports = ClassFactory