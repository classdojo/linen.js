memoize = require "./fn"

###
 caches remote values
###

class ModelMemoizer

  ###
  ###

  constructor: (@model) ->
    @schema = model.schema
    @_memoizedFields = {}

    # max age for the memoized field
    @_maxAge = 1000 * 10

    @load = memoize ((next) =>
      @_load next
    ), { maxAge: !@_maxAge }

  ###
  ###

  loadField: (fieldName, next) ->

    # find the closes field
    field = @schema.field(fieldName, true)

    memo = @_memoizedFields[field.path]

    # no memo? create it
    unless memo
      memo = @_memoizedFields[field.path] = memoize ((next) ->
        field.load next
      ), { maxAge: @_maxAge }

    
    # load the memo
    memo next

  ###
  ###

  _load: (next) ->
    @schema.load model, next


module.exports = ModelMemoizer