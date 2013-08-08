
Model          = require "./model"
type           = require "type-component"
Field          = require "./field"
payload        = require "./payload"
dref           = require "dref"

class Schema extends Field

  ###
  ###

  constructor: (options) ->
    super options

    @_modelClass  = options.modelClass or Model
    @_createModel = options.createModel or @_defaultCreateModel


  ###
  ###

  isNew: (model) -> !model.get "_id"

  ###
  ###

  model: (data = {}) ->

    # is a string? must be an id
    if type(data) is "string"
      data = { _id: data }


    # setup the model
    # TODO @map data
    model = @_createModel @, data

    model

  ###
  ###

  save: (model, next) ->

    # TODO - there should be a change watcher instead
    p = payload.model(model)

    if model.isNew()
      p.method("post").
      body @toJSON(model)
    else
      p.method("put").
      body @toJSON(model, { fields: ct = @_getChangedFields(model) })

    @fetchAll p.options, next


  ###
  ###

  _getChangedFields: (model) ->

    changedFields = []

    for field in @allFields
      if model._changeWatcher.change(field.path)
        changedFields.push(field)

    changedFields


  ###
  ###

  _defaultCreateModel: (schema, data) -> new @_modelClass @, data



  


module.exports = (options = {}, name = undefined, linen = undefined) ->
  options._id = "string"
  new Schema(Field.parseOptions(options, name, linen)).init()