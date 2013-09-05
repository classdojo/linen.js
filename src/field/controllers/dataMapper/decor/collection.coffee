bindable = require "bindable"
toarray  = require "toarray"
SubMapper = require "./sub"

class CollectionMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_subMapper = new SubMapper field

  ###
  ###

  map: (model, source) ->

    unless source
      source = []

    if source.__isCollection
      return source

    c = new bindable.Collection()
    c.reset toarray(source).map (item) => 
      @_subMapper.map model, item
    c

  normalize: (model) ->
    model.get(@field.path)

  ###
  ###

  @test: (field) -> 
    field.options.collection is true

module.exports = CollectionMapper