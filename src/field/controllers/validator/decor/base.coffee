class BaseValidator
  
  ###
  ###

  constructor: (@field) ->
  
  ###
  ###

  validate: (model, next) ->
    next()

  ###
  ###

module.exports = BaseValidator