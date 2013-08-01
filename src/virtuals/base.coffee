class BaseVirtual
  
  ###
  ###

  constructor: (@schema) ->

  ###
  ###

  fetch: (model, next) -> next()
  

module.exports = BaseVirtual