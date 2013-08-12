class FnFactory

  ###
  ###

  constructor: (@fn) ->

  ###
  ###

  test: (data) -> @fn.test data

  ###
  ###

  create: (data) -> @fn data

module.exports = FnFactory