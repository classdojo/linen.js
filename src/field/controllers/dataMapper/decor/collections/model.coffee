bindable = require "bindable"

class ModelCollection extends bindable.Collection

  ###
  ###

  constructor: (@field, @owner) ->
    super()

    @transform().map (v) => 
      @field._refMapper.map @owner, v

    @on 
      insert: @_onInsert
      remove: @_onRemove

  ###
  ###

  model: (data = {}) ->
    model = @field._refMapper.map data, data
    model.owner = @owner
    model.once "save", () => @push model
    model

  ###
  ###

  _onInsert: (model) =>
    model.once "remove", () =>
      @remove model

  ###
  ###

  _onRemove: (model) =>


module.exports = ModelCollection