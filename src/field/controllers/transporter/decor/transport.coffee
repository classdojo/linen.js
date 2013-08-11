hashObject = require "../memoize/hashObject"
dref = require "dref"

class Transport extends require("./base")

  ###
  ###

  constructor: () ->
    super arguments...

    @_request = @field.options.request

    @_memoOps = {
      maxAge: 1000 * 10
    }

  ###
  ###

  request: (options, next) -> 

    payload = @_getPayload options

    # memoize the payload so that we don't call more times than needed
    options.model._memos.call currentHash = @_payloadHash(options), @_memoOps, next, (next) =>  

      method = @_request[payload.method]

      unless method
        return next(new Error("cannot \"#{options.method.toUpperCase()}\" \"#{@field.path}\""))

      method options, (err, result = {}) =>

        # enforce asynchronous behavior - fetch might not be async - if it isn't,
        # it might break data-bindings
        setTimeout (() =>
          return next(err) if err?

          options.model.reset result, @field.path

          # replace the old memo hash with the current one from the server
          options.model._memos.replaceHash currentHash, @_payloadHash(payload)

          next()
        ), 0

  ###
  ###

  _getPayload: (options) ->

    payload = {
      model: options.model,
      method: @_getMethod(options)
    }

    # grab the data the server expects
    if /post|put/.test payload.method
      payload.data = @_getPayloadData payload

    # pluck out anything that hasn't changed
    #if payload.method is "put"
    #  console.log "UT"



    payload

  ###
  ###

  _getPayloadData: (payload) ->
    model = payload.model
    dataFields = @_getDataFields @field
    d = {}
    for field in dataFields
      dref.set d, field.path, field._mapper.normalize model, model.get(field.path)


  ###
  ###

  _getMethod: (options) ->
    if options.method is "get"
      return "get"
    if options.method is "set"
      if options.model.get("_id")
        return "put"
      else
        return "post"

    options.method


  ###
  ###

  _getDataFields: (startField) ->

    paths = []

    for field in startField.fields
      continue if field.options.request
      paths.push field
      paths = paths.concat @_getDataFields field

    paths



  ###
  ###

  _payloadHash: (payload) ->

    hash = {
      method: payload.method,
      path: @field.path
    }

    hashObject hash
  
  ###
  ###

  @test: (field) -> !!field.options.request



module.exports = Transport