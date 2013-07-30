bindable  = require "bindable"
Model     = require "./model"
type      = require "type-component"
Validator = require "./validator"
_         = require "underscore"

class Schema

  ###
  ###

  constructor: (options, @name, @linen) ->

    @_fields = {}

    # first parse the definition
    @_parseDefinition options

    # next, add the validator, and virtuals
    @validator = new Validator @

  ###
  ###

  model: (data) -> @map data

  ###
  ###

  map: (data) ->

    # is a string? must be an id
    if type(data) is "string"
      data = { _id: data }

    # setup the model
    model = new Model @

    # setup the virtual methods
    for key of @_methods
      model[key] = @_methods[key]

    # resets the data without triggering persistence
    model.reset data

    model


  ###
    model.get(k)
  ###

  vget: (model, key) -> @get(key)?.value(model)

  ###
    model.set(k, v)
  ###

  vset: (model, key, value) -> @get(key)?.map(value) ? value

  ###
  ###

  field: (property = "") -> 
    path = property.split "."
    field = @_fields[path.shift()]

    if field and path.length
      return field.field path.join(".")
    else
      return field

  ###
  ###

  value: (model) -> 

  ###
  ###

  default: (model) -> 
 

  ###
    model.fetch() OR when a property is listened to
  ###

  fetch: (payload, key = undefined) ->

  ###
  ###

  validate: (model, next) -> 
    @validator.validate model, next

  ###
   parse a definition. Something like:

   {
    name: "string",
    address: {
      $type: "string"
    },
    $fetch: function() {
  
    }
   }
  ###

  _parseDefinition: (definition) -> 

    ops = {
      $name: @name
    }


    # array? it's a collection of items
    if (t = type(definition)) is "array"
      ops = definition[0]
      ops.collection = true

    else if t is "object"
      _.extend ops, definition

    else if t is "string"
      ops.$type = definition

    schemaOptions = {}

    # split the schema options from the 
    # sub-fields
    for property of ops

      # it's a modifier for the schema. Convert it.
      if property.substr(0, 1) is "$"
        schemaOptions[property.substr(1)] = ops[property]
      else
        @_fields[property] = new Schema ops[property], property, @linen

    @options = schemaOptions




module.exports = Schema