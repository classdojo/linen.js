hashObject = require "../memoize/hashObject"
dref = require "dref"
type = require "type-component"

class Transport extends require("./base")

  ###
  ###

  constructor: () ->
    super arguments...

    @_request = @field.options.request
    @_map     = @_request.map or (data) -> data

    @_memoOps = {
      maxAge: 1000 * 10
    }

  ###
  ###

  watching: (options) -> @request options, () ->

  ###
  ###

  request: (options, next = () ->) -> 

    # prepare the cache - might be the first time it's being used
    options.model._cache.prepare()

    payload = @_getPayload options
    model = payload.model

    # nothing to save.
    if payload.method is "put" and type(payload.data) is "object" and Object.keys(payload.data).length is 0
      return next()


    method = @_request[payload.method]

    unless method
      return next()

    currentHash = @_payloadHash(options)
    fieldHash   = @_fieldHash(payload)

    # memoize the payload so that we don't call more times than needed

    if options.hard
      return load next

    options.model._memos.call fieldHash, currentHash, @_memoOps, next, (next) =>
      method = @_request[payload.method]


      method payload, (err, result = {}) =>

        # enforce asynchronous behavior - fetch might not be async - if it isn't,
        # it might break data-bindings
        setTimeout (() =>
          return next(err) if err?

          # ignore changes here so the don't get re-persisted to the server
          # also - copy the result incase anything gets added to it - don't want
          # new data to get cached
          options.model.reset @_map.call(model, result), @field.path

          model._cache.store @_getPayloadData(payload, false)

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
      payload.data = @_getPayloadData payload, payload.method isnt "post"
      # TODO - this should be a field option not to normalize data
      if payload.data
        delete payload.data._id



    payload

  ###
  ###

  _getPayloadData: (payload, pluck = true) ->

    model = payload.model
    dataFields = @_getDataFields @field
    d = {}

    if @field.parent
      dref.set d, @field.path, @field._mapper.normalize model, model.get(@field.path)
    
    for field in dataFields
      newData = field._mapper.normalize model, model.get(field.path)
      dref.set d, field.path, newData

    if pluck 
      d = model._cache.pluck d, true

    if d and @field.parent
      d = dref.get(d, @field.path)


    d ? {}

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
      continue if field.options.request or field.options.persist is false
      paths.push field
      paths = paths.concat @_getDataFields field

    paths


  ###
  ###

  _fieldHash: (options) ->
    hashObject {
      method: options.method,
      path: @field.path
    }

  ###
  ###

  _payloadHash: (options) ->
    hashObject {
      method: options.method,
      path: @field.path,
      hash: options.hash
    }
  
  ###
  ###

  @test: (field) -> !!field.options.request



module.exports = Transport