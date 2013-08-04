memoize = require "./fn"

class MemoDictionary
  
  ###
  ###

  constructor: () ->
    @_memos = {}

  ###
  ###

  call: (key, options, next, fn) ->
    memo = @_memos[key]

    unless memo
      memo = @_memos[key] = memoize ((next) =>
        fn next
      ), options or {}

    memo next


module.exports = MemoDictionary