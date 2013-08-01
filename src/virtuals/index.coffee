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

    @_virtuals = []

    if ops.default?
      @_virtuals.push new DefaultMapper @schema

    @_virtuals.push new FnMapper @schema

    if ops.multi
      @_virtuals.push new CollectionMapper @schema
    else if ops.ref
      @_virtuals.push new ReferenceMapper @schema


  ###
  ###

  fetch: (model, next = () ->) ->
    async.forEach @_virtuals, ((mapper, next) ->
      mapper.fetch model, next
    ), next



module.exports = Virtual