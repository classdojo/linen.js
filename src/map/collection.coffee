ModelCollection = require "../collections/model"
PrimitiveCollection = require "../collections/primitive"
type = require "type-component"
toarray = require "toarray"

class CollectionMapper extends require("./base")
  
  ###
  ###

  map: (model, value) ->

    if value?.__isCollection
      return value

    newValue = @_createCollection()
    newValue.owner = model
    newValue.reset toarray value

    newValue


  ###
  ###

  _createCollection: () -> 
    if @field.options.ref
      return new ModelCollection @field
    else
      return new PrimitiveCollection @field

module.exports = CollectionMapper