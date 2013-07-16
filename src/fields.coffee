async = require "async" 

class Fields

  ###
  ###

  constructor: (@schema) ->
    @_fields = {}

  
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

  toArray: () ->
    fields = []
    for fieldName of @_fields
      fields.push @get fieldName

    fields

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
  ###

  default: (data, model) ->
    d = JSON.parse JSON.stringify data
    for fieldName of @_fields
      field = @_fields[fieldName]
      v = field.default d[fieldName]

      if v?
        d[fieldName] = v
        if field.options.ref
          v.owner = model

    d


  ###
  ###

  map: (model, key, value) ->
    return value unless (field = @get(key))
    field.map model, value
  ###
  ###

  fetch: (payload, next) ->

    # 1. find all the virtual values that aren't actually
    # apart from the model, and save them individually 
    # 2. save the remaining data as the model
    async.each @names(), ((fieldName, next) =>
      field = @get(fieldName)
      field.fetch payload, next
    ), next



  
module.exports = Fields