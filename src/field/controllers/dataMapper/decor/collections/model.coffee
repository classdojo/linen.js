bindable = require "bindable"

class ModelCollection extends bindable.Collection

  ###
  ###

  constructor: (@field, @owner) ->
    super()

    @transform().map (v) => 
      @field._refMapper.map @owner, v

  ###
  ###

  model: (data = {}) ->
    model = @field._refMapper.map data, data
    model.owner = @owner
    model.once "save", () => @push model
    model

module.exports = ModelCollection