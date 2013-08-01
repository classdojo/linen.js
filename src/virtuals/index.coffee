# maps bindable.Collection
CollectionMapper = require "./collection"
ReferenceMapper  = require "./reference"
DefaultMapper    = require "./default"
FnMapper         = require "./fn"
async            = require "async"

class Virtual

  ###
  ###

  constructor: (@field) ->

    ops = @field.options

    @_virtuals = []

    if ops.default?
      @_virtuals.push new DefaultMapper @field

    @_virtuals.push new FnMapper @field

    if ops.multi
      @_virtuals.push new CollectionMapper @field
    else if ops.ref
      @_virtuals.push new ReferenceMapper @field


  ###
  ###

  fetch: (model, next = () ->) ->
    async.forEach @_virtuals, ((mapper, next) ->
      mapper.fetch model, next
    ), next

  ###
  ###

  cast: (data) ->
    for virtual in @_virtuals
      data = virtual.cast data
    data



module.exports = Virtual