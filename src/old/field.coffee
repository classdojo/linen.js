type       = require "type-component"
verify     = require("verify")()
comerr     = require "comerr"
Collection = require "./collection"

class Field
  
  ###
  ###

  constructor: (@property, options, @schema, @parent = null) ->
    @linen = schema.linen
    @options = @_setProperties options

  ###
  ###

  path: () ->
    return @_path if @_path
    path = []
    p = @
    while p
      path.push @property
      p = p.parent

    @_path = path.join "."


  ###
   validates whether the value is correct based on the field
   definition
  ###

  validate: (model) ->

    value = model.get @path()

    errors = []

    # if this field is a collection, then make sure the value
    # is a collection as wella
    if @options.$multi
      unless value?.__isCollection
        errors.push new comerr.Invalid "#{@property} must be a collection"
      else
        values = value.source()
    else
      values = [value]

    for v in values

      if not @_test(v) and (v isnt undefined or @options.$required)
        errors.push new comerr.Invalid "'#{@property}' is invalid", { field: @ }

      if @options.$ref and not (v?.__isModel and v.schema.name isnt @options.$ref)
        errors.push new comerr.Invalid "'#{@property}' must be type #{@options.$ref}"

    errors

  ###
   saves a value if there's a virtual method for it. Otherwise
   nothing really happens
  ###

  save: (value) ->

  ###
   maps a value based on its type - this happens only once
  ###

  map: (value) ->


    # grab the default value
    def = @_default value

    if @options.$map 
      def = @options.$map

    # return a collection if multiple
    return new Collection(@) if @options.$multi 

    # return the value if there isn't an object reference
    return value unless @options.$ref
    return @linen.model(@options.$ref, value)

  ###
  ###

  _default: (value) ->  
    return value unless @options.$default
    return @options.$default() if type(@options) is "function"
    return @options.$default

  ###
  ###

  _setProperties: (options) ->

    ops = {}
    @children = new Field.Fields @schema, @

    
    # fields:
    #   name: "string"

    if (t = type(options)) is "string"
      ops.$type = options
    else if t is "array"
      ops.$multi = true
      ops = options[0]
    else
      ops = options

    @_test = @_getValueTester ops


    # if $type or $ref isn't defined, then it's something like:
    #
    # fields:
    #   name:
    #     first: "string"
    #     last: "string"

    if not ops.$type and not ops.$ref
      @children.addFields ops 

    ops

  ###
  ###

  _getValueTester: (ops) ->

    return ops.$test if ops.$test

    tester = verify.tester()

    for key of ops
      k = key.substr(1)
      if !!tester[k]
        tester[k].apply tester, toarray ops[key]



    (value) => tester.test value


module.exports = Field