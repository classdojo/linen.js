toarray = require "toarray"
async   = require "async"
dref    = require "dref"

validatorClasses = [
  require("./type"),
  require("./fn")
]

class Validator
  
  ###
  ###

  constructor: (@schema) ->

    @required = @schema.options.required

    validators = []
    options    = toarray(schema.options.validate)

    #options has type, which needs a validator
    options.push @schema.options

    for op in options
      validator = @_getValidator op
      continue unless validator
      validators.push validator

    @_validators = validators


  ###
  ###

  validate: (value, next) ->

    # doesn't exist?
    unless value?
      if @required
        return next new Error "must be defined"
      else
        return next()

    async.forEach @_validators, ((validator, next) ->
      validator.validate value, next
    ), next

  ###
  ###

  _getValidator: (options) ->
    for validatorClass in validatorClasses  
      if validatorClass.test options
        return new validatorClass options




    


module.exports = Validator