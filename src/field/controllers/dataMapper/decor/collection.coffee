bindable = require "bindable"
toarray  = require "toarray"

class CollectionMapper extends require("./base")

  ###
  ###

  map: (model, source) ->

    unless source
      source = []

    if source.__isCollection
      return source

    c = new bindable.Collection()
    c.reset toarray(source).map (item) => 
      @_mapChildFields model, item
    c

  normalize: (source) -> 
    source

  ###
  ###

  @test: (field) -> field.options.collection is true

module.exports = CollectionMapper