Field  = require "./field"
Fields = require "./fields"
type   = require "type-component"
verify = require("verify")()
toarray = require "toarray"

###
 parses a schema definition
###

class Parser

  ###
  ###

  constructor: () ->

  ###
  ###

  parse: (schema, definition) ->
    fields = new Fields schema
    @_parseFields definition, fields, []
    fields

  ###
  ###

  _parseFields: (options, fields, path) ->
    ops = {}


    # fields:
    #   name: "string"

    if (t = type(options)) is "string"
      ops.$type = options
    else if t is "array"
      ops = options[0]
      ops.$multi = true
    else
      ops = options


    # if $type or $ref isn't defined, then it's something like:
    #
    # fields:
    #   name:
    #     first: "string"
    #     last: "string"

    unless @_hasOps ops
      for key of ops
        @_parseFields ops[key], fields, path.concat key
    else
      test = @_getValueTester ops

      fops = 
        ref      : ops.$ref
        test     : test
        multi    : ops.$multi
        property : path.join(".")
        default  : ops.$default
        map      : ops.$map
        save     : ops.$save
        get      : ops.$get
        set      : ops.$set
        bind     : ops.$bind


      fields.add new Field fields, fops


  ###
  ###

  _getValueTester: (ops) ->

    return ops.$test if ops.$test

    if ops.$type
      ops.$is = ops.$type
      delete ops.$type

    tester = verify.tester()


    for key of ops
      k = key.substr(1)
      if !!tester[k]
        tester[k].apply tester, toarray ops[key]


    (value) => tester.test value


  ###
  ###

  _hasOps: (options) ->
    for key of options
      return true if key.substr(0, 1) is "$"
    return false



module.exports = new Parser()