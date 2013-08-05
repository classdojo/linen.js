dref = require "dref"
hashObject = require "../utils/hashObject"
type = require "type-component"

class FnFetch extends require("./base")

  ###
  ###

  fetch: (payload, next) ->

    if payload.body
      payload.currentData = dref.get(payload.body, @field.path)

    payload.field = @field

    @_fetch payload, next


  ###
  ###

  _fetch: (payload, next) ->

    method = payload.method

    # make sure there's data actually being sent to the server
    if /post|put/.test payload.method
      if type(payload.currentData) is "object" and not Object.keys(payload.currentData or {}).length 
        return next()

    # make the request, but keep track of the data being sent to the server
    payload.model._memoizer.call currentHash = @_getPayloadHash(payload), @field.options.memoize ? { maxAge: 1000 * 5 }, next, (next) =>
      @_fetch payload, next

      
      unless (fn = @field.options.fetch[method])
        return next(new Error("method \"#{method}\" on \"#{@field.path}\" doesn't exist"))

      fn.call payload.model, payload, (err, result = {}) =>

        # enforce asynchronous behavior - fetch might not be async - if it isn't,
        # it might break data-bindings
        setTimeout (() =>
          return next(err) if err?

          @field.reset payload.model, result

          # replace the old memo hash with the current one from the server
          payload.model._memoizer.replaceHash currentHash, @_getPayloadHash(payload)

          next()
        ), 0

  ###
    used for memoizing responses
  ###

  _getPayloadHash: (payload) ->
    hashObject { 
      data: if payload.method isnt "get" then @_flattenModelValues(payload.model) else undefined, 
      method: payload.method, 
      path: @field.path,
      query: payload.query
    }

  ###
  ###

  _flattenModelValues: (model) ->
    d = []
    for field in @field.allFields
      d.push model.get field.name
    d


module.exports = FnFetch