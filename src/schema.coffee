
Model      = require "./model"
type       = require "type-component"
Field      = require "./field"

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

    model.reset @map model, data

    # attach the methods defined in this schema
    for key of @_methods
      model[key] = @_methods[key]

    model

  

  

module.exports = (options = {}, name = undefined, linen = undefined) ->
  new Schema(Field.parseOptions(options, name, linen)).init()