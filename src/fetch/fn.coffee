dref = require "dref"
hashObject = require "../utils/hashObject"

class FnFetch extends require("./base")

  ###
  ###

  fetch: (payload, next) ->

    if payload.body
      payload.currentData = dref.get(payload.body, @field.path)

    payload.field = @field

    @_fetch2 payload, next


  ###
  ###

  _fetch2: (payload, next) ->

    payloadHash = hashObject { 
      data: payload.currentData, 
      method: payload.method, 
      path: @field.path 
    }

    payload.model._memoizer.call payloadHash, @field.options.memoize ? { maxAge: 1000 * 5 }, next, (next) =>
      @_fetch payload, next


  ###
  ###

  _fetch: (payload, next) ->

    method = payload.method

    unless (fn = @field.options.fetch[method])
      return next(new Error("method \"#{method}\" on \"#{@field.path}\" doesn't exist"))

    fn.call payload.model, payload, (err, result = {}) =>

      # enforce asynchronous behavior - fetch might not be async - if it isn't,
      # it might break data-bindings
      setTimeout (() =>
        return next(err) if err?

        @field.reset payload.model, result

        next()
      ), 0


module.exports = FnFetch