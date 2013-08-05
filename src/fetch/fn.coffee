
class FnFetch extends require("./base")

  ###
  ###

  fetch: (payload, next) ->
    method = payload.method

    payload.model._memoizer.call @field.path, @field.options.memoize ? { maxAge: 1000 * 5 }, next, (next) =>

      unless (fn = @field.options.fetch[method])
        return next(new Error("method \"#{method}\" on \"#{@field.path}\" doesn't exist"));

      payload.field = @field

      fn.call payload.model, payload, (err, result = {}) =>

        # enforce asynchronous behavior - fetch might not be async - if it isn't,
        # it might break data-bindings
        setTimeout (() =>
          return next(err) if err?

          @field.reset payload.model, result

          next()
        ), 0


module.exports = FnFetch