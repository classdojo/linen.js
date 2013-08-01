# maps bindable.Collection
CollectionMapper = require "./collection"
ReferenceMapper  = require "./reference"
DefaultMapper    = require "./default"
FnMapper         = require "./fn"



class Virtual

  ###
  ###

  constructor: (@schema) ->

    ops = @schema.options


    @_mappers = []

    if ops.default?
      @_mappers.push new DefaultMapper @schema

    if ops.multi
      @_mappers.push new CollectionMapper @schema
    else if ops.ref
      @_mappers.push new ReferenceMapper @schema


  ###
  ###

  get: (model) ->

    for mapper in @_mappers
      v = mapper.get model, v

    v



module.exports = Virtual