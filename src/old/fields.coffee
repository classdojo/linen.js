Field   = require "./field"
toarray = require "toarray"
dref    = require "dref"


class Fields

  ###
  ###

  constructor: (@schema, @parent) ->
    @_fields = {}

  ###
   if anything is returned, then it's an error
  ###

  validate: (model, keys = []) ->
    errors = []

    unless keys
      keys = Object.keys @_fields
    
    for fieldName of @_fields
      errors = errors.concat toarray @_fields[fieldName].validate(model)

    if errors.length then errors.shift() else undefined

  ###
  ###

  get: (name) -> @_fields[name]

  ###
  ###

  map: (data) -> 

    d = JSON.parse JSON.stringify data

    for key of @_fields
      field = @get key
      continue unless field
      v = field.map data[key]
      continue unless v?
      d[key] = v

    d

  ###
  ###

  addFields: (options) ->
    for fieldName of options
      @_fields[fieldName] = new Field fieldName, options[fieldName], @schema, @parent


# beet circular reference
Field.Fields = Fields

module.exports = Fields