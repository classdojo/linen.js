Collection  = require "./collection"
Model       = require "./model"
comerr      = require "comerr"
type        = require "type-component"

class Field
  
  ###
  ###

  constructor: (@fields, @options) ->
    @schema    = @fields.schema
    @linen     = @schema.linen
    @property  = options.property
    @bind      = options.bind

  ###
   virtual might be remove, or local
  ###

  isVirtual: () -> @_refVirtual() or !!@options.fetch or !!@options.get or !!@options.set

  ###
  ###

  _refVirtual: () ->
    return false unless @options.ref
    return @linen.schemas.get(@options.ref).isVirtual()

  ###
  ###

  validate: (model) ->

    value = model.get @property


    # if this field is a collection, then make sure the value
    # is a collection as wella
    if @options.multi
      return unless @options.required
      unless value?.__isCollection
        return new comerr.Invalid "#{@property} must be a collection"
      else
        values = value.source()
    else
      values = [value]


    for v in values

      if (v is undefined or (type(v) == "string" && v.length == 0)) and not @options.required
        continue

      if not @options.test(v)
        error = new comerr.Invalid "'#{@property}' is invalid", { field: @ }

      if @options.ref and not (v?.__isModel and v.schema.name is @options.ref)
        error = new comerr.Invalid "'#{@property}' must be type #{@options.ref}"

      else if @options.ref
        error = v.validate()
        return error if error?

    error

  ###
  ###

  _fetch: (payload, next = () ->) ->

    if @options.methods and not ~@options.methods.indexOf(payload.method)
      return next()

    # ignore fetch if options.fetch doesn't exist - not a 
    # virtual field
    return next() unless @options.fetch
    payload.field = @
    @options.fetch payload, next

  ###
  ###

  fetch: (payload, next) ->

    value = payload.model.get @property

    switch payload.method
      when "POST"
        @_save value, payload, next
      when "PUT"
        @_save value, payload, next
      when "GET"
        @_get value, payload, next
      when "DELETE"
        @_del value, payload, next


  ###
  ###

  _get: (value, payload, next) -> 
    @_fetch payload, next

  ###
  ###

  _save: (value, payload, next) ->
    err   = @validate payload.model
    return next(err) if err?
    if @options.ref and not @options.multi
      if value?.hasChanged()
        value.save next
      else
        next()
    else
      if @options.multi
        if not payload.collection
          return next()
      else if not payload.data[@property]?
        return next()


      @_fetch payload, next


  ###
  ###

  _del: (value, payload, next) ->
    @_fetch payload, next


  ###
   maps a value based on its type - this happens only once
  ###

  default: (value) ->

    value = value or @_getDefault value

    if @options.map 
      value = @options.map value

    # return a collection if multiple
    return new Collection(@) if @options.multi

    return value

  ###
  ###

  map: (value) ->

    return value if @options.multi and value.__isCollection

    if @options.ref
      return value if value.__isModel
      model = @linen.model @options.ref, value
      model.field = @
      return model

    value

  ###
  ###

  _getDefault: (value) ->  
    return value unless @options.default?
    return @options.default.call(@) if type(@options.default) is "function"
    return @options.default





module.exports = Field