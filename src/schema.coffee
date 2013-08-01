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

  constructor: (@options, @name, @linen, @path) ->

    @fields = options.fields
    @fieldPaths = options.fields.map (field) -> field.path

    @_fieldsByKey = {}
    for field in @fields
      @_fieldsByKey[field.name] = field

    # next, add the validator, and virtuals
    @validator = new Validator @
    @virtuals  = new Virtuals @

  ###
  ###

  model: (data = {}) ->

    # is a string? must be an id
    if type(data) is "string"
      data = { _id: data }

    # setup the model
    model = new Model @

    # setup the virtual methods
    for key of @_methods
      model[key] = @_methods[key]

    model

  ###
   fetch a particular field - this is called
   once a property is watched
  ###

  fetchField: (model, fieldName) ->
    @field(fieldName)?.fetch(model)

  ###
   fetch the particular model
  ###

  fetch: (model, next) ->
    @virtuals.fetch model, next

  ###
   fetch ALL the fields in a given model
  ###

  fetchAll: (model, next) ->
    @fetch model, () =>
      async.forEach @fields, ((field, next) ->
        field.fetchAll model, next
      ), next

  ###
  ###

  persist: (model, changed) ->

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





parseSchemaOps = (definition, name, linen, path = []) ->

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
      pt = path.concat(property)
      fieldOps = parseSchemaOps ops[property], property, linen, pt
      fieldOps.property = property

      schemaOps.fields.push new Schema fieldOps, property, linen, pt.join(".")

  schemaOps

module.exports = (options, name, linen) ->
  new Schema parseSchemaOps(options, name, linen), name, linen