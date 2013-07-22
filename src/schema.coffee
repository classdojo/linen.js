type      = require "type-component"
parser    = require "./fieldParser"
Model     = require "./model"
flatstack = require "flatstack"

class Schema
  
  ###
  ###

  constructor: (@linen, @options = {}) ->
    @name    = options.name
    options.fields._id = "string"
    @fields  = parser.parse @, options.fields
    @methods = options.methods

  ###
  ###

  isVirtual: () -> !!@options.fetch

  ###
  ###

  model: (data, owner) ->
    d = {}

    if type(data) is "string"
      d._id = data
    else
      d = data or {}


    # return the new model, along with the
    # correct, mapped data
    m = new Model @
    m.setOwner owner
    
    if @options.map
      d = @options.map.call m, d

    m.reset d = @fields.default d, m
    m._bindFields()

    unless m.isNew()
      m.flushChanged()

    # copy the methods on over
    for methodName of @methods
      m[methodName] = @methods[methodName]

    m

  ###
  ###

  map: (model, key, value) -> @fields.map model, key, value

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
    @_fetch payload, next

  ###
  ###

  _save: (payload, next) ->
    callstack = flatstack()

    callstack.error (err) =>
      callstack.pause()
      next err

    model = payload.target
    modelData = undefined

    # filter out the keys which are NOT virtual
    changed = payload.changed
    usable  = changed.filter (value) => not @fields.get(value.key).isVirtual()

    if (payload.method is "POST" or usable.length)
      data = {}
      for item in changed
        data[item.key] = item.nv

      callstack.push (next) =>
        @_fetch payload, (err, result) ->
          return next(err) if err?
          modelData = result
          next()

    callstack.push (next) =>

      # first save the virtual fields
      @fields.fetch payload, next

    callstack.push () -> 
      next null, modelData


  ###
  ###

  _delete: (payload, next) ->

    unless payload.model.has("_id")
      return next(comerr.Invalid("_id must be present when deleting a model"))

    @_fetch payload, next


  ###
  ###

  _fetch: (payload, next = () ->) ->

    return next() unless @options.fetch

    @options.fetch payload, (err, result) ->
      return next(err) if err?
      next null, result


module.exports = Schema