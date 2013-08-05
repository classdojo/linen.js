bindable   = require "bindable"
Model      = require "./model"
type       = require "type-component"
Validator  = require "./validator"
_          = require "underscore"
dref       = require "dref"
outcome    = require "outcome"
async      = require "async"
getMapper  = require "./map/factory"
getFetcher = require "./fetch/factory"
getJSONify = require "./jsonify/factory"
payload    = require "./payload"


class Field

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

    @_addAllFields @, @allFields = []

    # next, add the validator, and virtuals
    @validator = new Validator @
    @mapper    = getMapper @
    @fetcher   = getFetcher @
    @jsonifier = getJSONify @

    for field in @fields
      field.init()

    @

  ###
   returns a field
  ###

  getField: (property = "", closest = false) -> 
    path = property.split "."
    field = @_fieldsByKey[path.shift()]

    if field and path.length
      return field.getField(path.join("."), closest) ? if closest then field else undefined
    else
      return field

  ###
  ###

  getFields: (fieldNames, closest = false) ->
    fields = []
    for property in fieldNames
      field  = @getField(property, closest)
      continue if not field or ~fields.indexOf field
      fields.push field
    fields

  ###
  ###

  _addAllFields: (start, allFields = []) ->
    
    if start isnt @
      allFields.push @

    for field in @fields
      field._addAllFields start, allFields

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
        data[field.name] = field.map model, data[field.name] ? model.get(field.path)

    data

  ###
  ###

  reset: (model, data) ->
    unless @parent
      model.set @map model, data
    else  
      model.set @path, @map model, data

  ###
  ###

  validate: (data, next) -> 

    @validator.validate data, (err) =>

      if err
        err.message = "'#{@name}' #{err.message}"
        return next(err)

      async.forEach @fields, ((field, next) =>
        field.validate dref.get(data, field.name), next
      ), next

  ###
  ###

  fetch: (payload, next) ->
    @fetcher.fetch payload, next

  ###
  ###

  canFetch: (model) -> @fetcher.canFetch model

  ###
  ###

  fetchAll: (payload, next) ->
    @fetch payload, (err) =>
      return next(err) if err?
      async.forEach @fields, ((field, next) =>
        field.fetchAll payload, next
      ), next

  ###
  ###

  load: (model, next) ->
    @fetch payload.
      model(model).
      method("get").options, next

  ###
  ###

  loadAll: (model, next) ->
    @load model, (err) =>
      return next(err) if err?
      async.forEach @fields, ((field, next) ->
        field.loadAll model, next
      ), next


  ###
  ###

  loadField: (model, name, next) ->
    return unless f = @_field(name, next)
    f.load model, next

  ###
  ###

  _field: (name, next) ->
    unless (f = @getField(name))
      next new Error("field \"#{name}\" doesn't exist")
      return false
    return f

  ###
  ###

  toJSON: (model, options = {}) -> 

    unless options.fields
      options.fields = @allFields

    data = {}

    for field in options.fields
      field.jsonifier.writeJSON model, data

    data



Field.parseOptions = (definition, name, linen, path = []) ->

  ops = { }

  fieldOps = {
    name: name,
    linen: linen,
    path: path.join("."),
    fields: []
  }

  # array? it's a collection of items
  if (t = type(definition)) is "array"
    ops = definition[0]
    ops.$collection = true

  else if t is "object"
    _.extend ops, definition

  else if t is "string"
    ops.$type = definition


  # split the field options from the 
  # sub-fields
  for property of ops

    # it's a modifier for the field. Convert it.
    if property.substr(0, 1) is "$"
      fieldOps[property.substr(1)] = ops[property]
    else
      pt = path.concat(property)
      fieldOps.fields.push new Field Field.parseOptions ops[property], property, linen, pt


  fieldOps

module.exports = Field