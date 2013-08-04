
class FnFetch
  
  ###
  ###

  constructor: (@field) ->

  ###
  ###

  fetch: (payload, next) ->
    method = payload.method

    unless (fn = @field.options.fetch[method])
      return next(new Error("method \"#{method}\" doesn't exist"))


    fn.call payload.model, payload, (err, result = {}) =>

      # enforce asynchronous behavior - fetch might not be async - if it isn't,
      # it might break data-bindings
      setTimeout (() =>
        return next(err) if err?

        unless @field.parent
          payload.model.set result
        else  
          payload.model.set @field.path, result

        next()
      ), 1


  

module.exports = FnFetch