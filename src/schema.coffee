bindable   = require "bindable"
Model      = require "./model"
type       = require "type-component"
Validator  = require "./validator"
_          = require "underscore"
dref       = require "dref"
outcome    = require "outcome"
async      = require "async"
Virtuals   = require "./virtuals"

class Schema

  ###
  ###

  constructor: (@options, @name, @linen) ->

    @_fields   = {}

    @fields = options.fields

    @_fieldsByKey = {}

    for field in @fields
      @_fieldsByKey[field.name] = field

    # next, add the validator, and virtuals
    @validator = new Validator @
    @virtuals  = new Virtuals @

  ###
  ###

  model: (data) ->

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

  vget: (model, key) -> @field(key)?.virtuals.get(model)

  ###
    model.set(k, v)
  ###

  vset: (model, key, value) -> 
    # @get(key)?.map(value) ? value

  ###
  ###

  field: (property = "") -> 
    path = property.split "."
    field = @_fieldsByKey[path.shift()]

    if field and path.length
      return field.field path.join(".")
    else
      return field

  ###
  ###

  value: (modelOrValue) -> 

    # property exists? 
    if @options.property
      value = dref.get modelOrValue, @options.property
    else
      value = modelOrValue

    value


  ###
  ###

  default: (model) -> 
 

  ###
    model.fetch() OR when a property is listened to
  ###

  fetch: (payload, key = undefined) ->

  ###
  ###

  validate: (modelOrValue, next) -> 

    value = @value modelOrValue


    @validator.validate value, (err) =>

      if err
        err.message = "'#{@name}' #{err.message}"
        return next(err)

      @_validateFields value, next

  ###
  ###

  _validateFields: (value, next) ->
    async.forEach @fields, ((field, next) =>
      field.validate value, next
    ), next

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





parseSchemaOps = (definition, name, linen) ->

  ops = { }

  schemaOps = {
    name: name,
    fields: []
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
      schemaOps[property.substr(1)] = ops[property]
    else
      fieldOps = parseSchemaOps ops[property], property, linen
      fieldOps.property = property

      schemaOps.fields.push new Schema fieldOps, property, linen

  schemaOps

module.exports = (options, name, linen) ->
  new Schema parseSchemaOps(options, name, linen), name, linen