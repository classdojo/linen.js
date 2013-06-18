Collection  = require "./collection"
Model       = require "./model"
comerr      = require "comerr"
type        = require "type-component"

class Field
  
  ###
  ###

  constructor: (@fields, options) ->
    @schema    = @fields.schema
    @linen     = @schema.linen
    @property  = options.property
    @_required = options.required
    @_map      = options.map
    @_multi    = options.multi
    @_ref      = options.ref
    @_default  = options.default
    @_test     = options.test 
    @_save     = options.save
    @get       = options.get
    @set       = options.set
    @bind      = options.bind

  ###
  ###

  isVirtual: () -> @_refVirtual() or !!@_save or !!@_get or !!@_set


  ###
  ###

  _refVirtual: () ->
    return false unless @_ref
    return @linen.schemas.get(@_ref).isVirtual()

  ###
  ###

  validate: (model) ->
    value = model.get @property


    # if this field is a collection, then make sure the value
    # is a collection as wella
    if @_multi
      unless value?.__isCollection
        error = new comerr.Invalid "#{@property} must be a collection"
      else
        values = value.source()
    else
      values = [value]

    for v in values
      if not @_test(v) and (v isnt undefined or @_required)
        error = new comerr.Invalid "'#{@property}' is invalid", { field: @ }

      if @_ref and not (v?.__isModel and v.schema.name is @_ref)
        
        error = new comerr.Invalid "'#{@property}' must be type #{@_ref}"

      else if @_ref
        error = v.validate()
        return error if error?

    error


  ###
  ###

  save: (payload, next) ->

    model = payload.model

    err = @validate model

    return next(err) if err?

    # is it a reference? call .save() on the ref
    if @_ref
      value = model.get @property
      if value?.hasChanged()
        value.schema.save payload.child(value), next
      else
        return next()
    else
      return next() if not ~payload.keys.indexOf(@property) or not @_save
      @_save payload.data([@property]), next


  ###
   maps a value based on its type - this happens only once
  ###

  default: (value) ->

    def = @_getDefault value

    if @_map 
      def = @_map value


    # return a collection if multiple
    return new Collection(@) if @_multi

    return def

  ###
  ###

  map: (value) ->

    return value if @_multi

    if @_ref
      return value if @_ref.__isModel
      return @linen.model @_ref, value

    value

  ###
  ###

  _getDefault: (value) ->  
    return value unless @_default
    return @_default.call(@) if type(@_default) is "function"
    return @_default



module.exports = Field