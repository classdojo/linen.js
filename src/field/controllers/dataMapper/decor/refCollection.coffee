bindable = require "bindable"
toarray  = require "toarray"
hoist    = require "hoist"
ReferenceMapper = require "./reference"
ModelCollection = require "./collections/model"

class CollectionMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_refMapper = new ReferenceMapper field

  ###
  ###

  map: (model, source) ->

    unless source
      source = []


    if source.__isCollection
      return source

    c = new ModelCollection @, model
    c.reset toarray source
    c
      
  ###
  ###

  normalize: (model) ->
    collection = model.get(@field.path)
    source = []
    
    for item in collection.source()
      source.push item.normalize()

    source



  ###
  ###

  @test: (field) -> 
    !!(field.options.collection and field.options.ref)

module.exports = CollectionMapper