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
      unless value?.__isCollection
        error = new comerr.Invalid "#{@property} must be a collection"
      else
        values = value.source()
    else
      values = [value]

    for v in values
      if not @options.test(v) and (v isnt undefined or @options.required)
        error = new comerr.Invalid "'#{@property}' is invalid", { field: @ }

      if @options.ref and not (v?.__isModel and v.schema.name is @options.ref)
        
        error = new comerr.Invalid "'#{@property}' must be type #{@options.ref}"

      else if @options.ref
        error = v.validate()
        return error if error?

    error

  ###
  ###

  fetch: (payload, next = () ->) ->

    # ignore fetch if options.fetch doesn't exist - not a 
    # virtual field
    return next() unless @options.fetch

    @options.fetch payload, next


    



  ###
  ###

  save: (payload, next) ->

    model = payload.target
    err   = @validate payload.target

    return next(err) if err?

    # is it a reference? call .save() on the ref
    if @options.ref
      value = model.get @property
      if value?.hasChanged()
        value.save next
      else
        return next()

    # otherwise make sure this field has changed before saving it
    else
      return next() unless payload.changed[@property]
      @fetch model, next


  ###
   maps a value based on its type - this happens only once
  ###

  default: (value) ->

    def = @_getDefault value

    if @options.map 
      def = @options.map value


    # return a collection if multiple
    return new Collection(@) if @options.multi

    return def

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
    return value unless @options.default
    return @options.default.call(@) if type(@options.default) is "function"
    return @options.default





module.exports = Field