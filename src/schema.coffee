type      = require "type-component"
parser    = require "./fieldParser"
Model     = require "./model"
flatstack = require "flatstack"

class Schema
  
  ###
  ###

  constructor: (@linen, options = {}) ->
    @name    = options.name
    @__fetch = options.fetch
    @fields  = parser.parse @, options.fields

  ###
  ###

  isVirtual: () -> !!@__fetch

  ###
  ###

  model: (data) ->
    d = {}

    if type(data) is "string"
      d._id = data
    else
      d = data or {}


    # return the new model, along with the
    # correct, mapped data
    m = new Model @
    m.reset d = @fields.default d

    unless m.isNew()
      m.flushChanged()

    m

  ###
  ###

  map: (key, value) -> @fields.map key, value

  ###
  ###

  validate: (model) -> 
    @fields.validate model


  ###
  ###

  fetch: (payload, next) ->
    switch payload.method
      when "GET" 
        @_get payload, next
      when "PUT" 
        @_save payload, next
      when "POST" 
        @_save payload, next
      when "DELETE" 
        @_delete payload, next

  ###
  ###

  _get: (payload, next) ->


    # fetch the virtual fields
    for field in @fields.toArray()
      continue unless field.isVirtual()
      field?.fetch payload

    @_fetch payload, next

  ###
  ###

  _save: (payload, next) ->
    callstack = flatstack()
    model = payload.model

    # filter out the keys which are NOT virtual
    changed = payload.changed
    usable  = changed.filter (value) => not @fields.get(value.key).isVirtual()

    if (payload.method is "POST" or usableKeys.length)
      data = {}
      for item in changed
        data[item.key] = item.nv

      callstack.push (next) =>
        @_fetch payload, next

    callstack.push (next2) =>

      # first save the virtual fields
      @fields.save payload, (err) =>
        return next(err) if err?
        next2()

    callstack.push () -> next()


  ###
  ###

  _delete: (payload, next) ->

    unless payload.model.has("_id")
      return next(comerr.Invalid("_id must be present when deleting a model"))

    @_fetch payload, next


  ###
  ###

  _fetch: (payload, next = () ->) ->
    return next() unless @__fetch
    @__fetch options, (err, result) ->
      return next(err) if err?
      options.model.set result
      next()


module.exports = Schema