async = require "async" 

class Fields

  ###
  ###

  constructor: (@schema) ->
    @_fields   = {}

  
  ###
  ###

  add: (field) -> 
    @_fields[field.property] = field

  ###
  ###

  get: (name) -> @_fields[name]

  ###
  ###

  names: () -> Object.keys @_fields

  ###
  ###

  validate: (model) -> 

    errors = []

    for fieldName of @_fields
      err = @_fields[fieldName].validate model
      if err
        errors.push err

    errors.shift()

  ###
   maps the model when initialized for the first time
  ###

  map: (data) ->

    d = JSON.parse JSON.stringify data
    for fieldName of @_fields
      d[fieldName] =  @_fields[fieldName].map d[fieldName]

    d

  ###
  ###

  save: (payload, next) ->
  
    # 1. find all the virtual values that aren't actually
    # apart from the model, and save them individually 
    # 2. save the remaining data as the model
    async.each @names(), ((fieldName, next) =>
      @get(fieldName).save payload, next
    ), next



  
module.exports = Fields