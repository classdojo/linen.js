bindable = require "bindable"
toarray  = require "toarray"
hoist    = require "hoist"
ReferenceMapper = require "./reference"

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

    c = new bindable.Collection()
    c.transform().map (v) => @_refMapper.map model, v
    c.reset toarray source
    c
    


  ###
  ###

  @test: (field) -> 
    !!(field.options.collection and field.options.ref)

module.exports = CollectionMapper