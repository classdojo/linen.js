hashObject = require "../memoize/hashObject"

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

  request: (payload, next) -> 

    # memoize the payload so that we don't call more times than needed
    payload.model._memos.call currentHash = @_payloadHash(payload), @_memoOps, next, (next) =>  

      method = @_request[payload.method]

      unless method
        return next(new Error("cannot \"#{payload.method.toUpperCase()}\" \"#{@field.path}\""))

      method payload, (err, result = {}) =>

        # enforce asynchronous behavior - fetch might not be async - if it isn't,
        # it might break data-bindings
        setTimeout (() =>
          return next(err) if err?

          payload.model.reset result, @field.path

          # replace the old memo hash with the current one from the server
          payload.model._memos.replaceHash currentHash, @_payloadHash(payload)

          next()
        ), 0

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