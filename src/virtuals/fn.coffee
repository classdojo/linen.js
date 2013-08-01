_findFetch: (schema) -> 
  p = schema

  while p and !p.options.fetch
    p = p.parent

  p?.options.fetch

class FnVirtual extends require("./base")

  ###
  ###

  constructor: (schema) ->
    super schema
    @_fetch = @_findFetch schema

  ###
  ###

  fetch: (model, next) ->
    return next() if model.isNew()?

    @_fetch.call model, (err, result) ->
      return next(err) if err?

      console.log result

  ###
  ###

  _findFetch: (schema) -> 
    p = schema

    while p and !p.options.fetch
      p = p.parent

    p?.options.fetch

module.exports = FnVirtual