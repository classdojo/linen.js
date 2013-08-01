# maps bindable.Collection
CollectionMapper = require "./collection"
ReferenceMapper  = require "./reference"
DefaultMapper    = require "./default"
FnMapper         = require "./fn"
async            = require "async"

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

  fetch: (model, next = () ->) ->
    async.forEach @_mappers, ((mapper, next) ->
      mapper.fetch model, next
    ), next



module.exports = Virtual