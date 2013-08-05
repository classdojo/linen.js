dref = require "dref"

class FnFetch extends require("./base")

  ###
  ###

  fetch: (payload, next) ->

    if payload.body
      payload.currentData = dref.get(payload.body, @field.path)

    payload.field = @field

    # only cache when fetching data
    if payload.method is "get"
      @_get payload, next

    # persisting delete / update / post shouldn't be blocked
    else
      @_fetch payload, next

  ###
  ###

  _get: (payload, next) ->
    payload.model._memoizer.call @field.path, @field.options.memoize ? { maxAge: 1000 * 5 }, next, (next) =>
      @_fetch payload, next



  ###
  ###

  _fetch: (payload, next) ->

    method = payload.method

    unless (fn = @field.options.fetch[method])
      return next(new Error("method \"#{method}\" on \"#{@field.path}\" doesn't exist"));


    fn.call payload.model, payload, (err, result = {}) =>

      # enforce asynchronous behavior - fetch might not be async - if it isn't,
      # it might break data-bindings
      setTimeout (() =>
        return next(err) if err?

        @field.reset payload.model, result

        next()
      ), 0


module.exports = FnFetch