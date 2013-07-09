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
    ops = options


    # fields:
    #   name: "string"

    t = type()

    if type(ops) is "array"
      ops   = ops[0]
      multi = true

    if type(ops) is "string"
      ops = { $type: ops }

    if multi
      ops.$multi = multi


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

      fops = {}

      for opName of ops
        fops[opName.substr(1)] = ops[opName]


      fops.test = test
      fops.property = path.join(".")
      


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


    (value) => 
      if type(value) is "string" and not value.length
        return false
      return tester.test value


  ###
  ###

  _hasOps: (options) ->
    for key of options
      return true if key.substr(0, 1) is "$"
    return false



module.exports = new Parser()