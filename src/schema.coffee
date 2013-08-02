bindable   = require "bindable"
Model      = require "./model"
type       = require "type-component"
Validator  = require "./validator"
_          = require "underscore"
dref       = require "dref"
outcome    = require "outcome"
async      = require "async"
getMapper  = require "./map/factory"

class Schema

  ###
  ###

  constructor: (@options) ->

    @fields     = options.fields
    @name       = options.name
    @linen      = options.linen
    @path       = options.path

    @fieldNames = []

    @_fieldsByKey = {}

    for field in @fields
      @_fieldsByKey[field.name] = field
      @fieldNames.push field.name
      field.parent = @

  ###
  ###

  init: () ->
    # next, add the validator, and virtuals
    @validator = new Validator @
    @mapper    = getMapper @

    for field in @fields
      field.init()

    @


  ###
  ###

  model: (data = {}) ->

    # is a string? must be an id
    if type(data) is "string"
      data = { _id: data }

    # setup the model
    # TODO @map data
    model = new Model @, { _id: data._id }

    model.reset @map model, data

    # attach the methods defined in this schema
    for key of @_methods
      model[key] = @_methods[key]

    model

  ###
   fetch a particular field - this is called
   once a property is watched
  ###

  fetchField: (model, fieldName, next) ->
    @field(fieldName)?.fetch model, next

  ###
   fetch the particular model
  ###

  fetch: (model, next) ->

    #TODO - memoize field property to memoization collection
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
   returns a field
  ###

  field: (property = "") -> 
    path = property.split "."
    field = @_fieldsByKey[path.shift()]

    if field and path.length
      return field.field path.join(".")
    else
      return field

  ###
   maps to the proper data type
   TODO - default, g/s
  ###

  map: (model, data) -> 
    data = @mapper.map model, data

    # nested? must be an object
    if @fields.length
      if !data
        data = {}
      for field in @fields
        data[field.name] = field.map model, data[field.name]

    data


  ###
  ###

  validate: (data, next) -> 

    @validator.validate data, (err) =>

      if err
        err.message = "'#{@name}' #{err.message}"
        return next(err)

      @_validateFields data, next

  ###
  ###

  _validateFields: (data, next) ->
    async.forEach @fields, ((field, next) =>
      field.validate dref.get(data, field.name), next
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
    linen: linen,
    path: path.join("."),
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

      schemaOps.fields.push new Schema fieldOps

  schemaOps

module.exports = (options, name, linen) ->
  new Schema(parseSchemaOps(options, name, linen)).init()