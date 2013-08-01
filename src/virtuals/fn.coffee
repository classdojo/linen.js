_findFetch: (schema) -> 
  p = schema

  while p and !p.options.fetch
    p = p.parent

  p?.options.fetch

class FnVirtual extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_fetcher = @_findFetcher field
    @_fetch = @_fetcher?.options.fetch

  ###
  ###

  fetch: (model, next) ->

    # TODO - @_fetch should be tested out in @test
    return next() if model.isNew() or !@_fetch

    @_fetch.call model, (err, result) =>
      return next(err) if err?

      v = @_fetcher.map result

      unless @_fetcher.path
        model.reset v
      else
        model.set @_fetcher.path, v

      next()

  ###
   finds explicit $fetch fn
  ###

  _findFetcher: (field) -> 
    p = field

    while p and !p.options.fetch
      p = p.parent

    p

module.exports = FnVirtual