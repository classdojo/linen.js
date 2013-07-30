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

    @property = @schema.options.property
    @name     = @schema.options.name
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

  validate: (modelOrValue, next) ->

    # property exists? 
    if @property
      value = dref.get modelOrValue, @property
    else
      value = modelOrValue

    # doesn't exist?
    unless value?
      if @required
        return new Error "'#{@name}' must be present"
      else
        return next()

    async.forEach @_validators, ((validator, next) ->
      validator.validate value, next
    ), (err) =>

      if err
        err.message = "'#{@name}' #{err.message}"
        return next err

      @_validateFields value, next

  ###
  ###

  _validateFields: (value, next) ->
    async.forEach @schema.fields, ((field, next) =>
      field.validate value, next
    ), next

  ###
  ###

  _getValidator: (options) ->
    for validatorClass in validatorClasses  
      if validatorClass.test options
        return new validatorClass options




    


module.exports = Validator