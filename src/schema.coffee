
Model          = require "./model"
type           = require "type-component"
Field          = require "./field"
MemoDictionary = require "./memoize/dictionary"
payload        = require "./payload"
ChangeWatcher  = require "./changeWatcher"

class Schema extends Field

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
    model = new Model @, { _id: data._id }

    # attach a model memoizer so that values are cached
    # for a bit before being re-fetched
    model._memoizer     = new MemoDictionary()
    model._changeWatcher = new ChangeWatcher model

    @reset model, data

    # attach the methods defined in this schema
    for key of @_methods
      model[key] = @_methods[key]

    model

  ###
  ###

  save: (model, next) ->

    # TODO - there should be a change watcher instead
    d = model._flushChanges()
    p = payload.model(model)

    if model.isNew()
      p.method("post").
      body @_getModelData(model.data, @fields(model._changeWatcher.flushChangesKeys(), true))
    else
      p.method("put").
      body @_getModelData model.data



    @fetch p.options, next

  ###
  ###

  toObject: (model) -> @_getModelData model.data

  ###
  ###

  _getModelData: (data, fields = @allFields) ->
    







module.exports = (options = {}, name = undefined, linen = undefined) ->
  new Schema(Field.parseOptions(options, name, linen)).init()