class BaseTransport

  ###
  ###

  constructor: (@field) ->

  ###
  ###

  request: (options, next = () ->) -> next()

  ###
  ###

  watching: (options, next = () ->) -> next()



module.exports = BaseTransport

