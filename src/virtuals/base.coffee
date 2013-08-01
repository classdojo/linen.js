class BaseVirtual
  
  ###
  ###

  constructor: (@field) ->

  ###
  ###

  fetch: (model, next) -> next()

  ###
   casts a value to another type
  ###

  cast: (model, value) -> value

  

module.exports = BaseVirtual