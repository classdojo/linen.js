memoize = require "./fn"

class MemoDictionary
  
  ###
  ###

  constructor: () ->
    @_memos = {}

  ###
  ###

  call: (key, hash, options, next, fn) ->


    memo = @_memos[key]

    if memo
      if memo.hash isnt hash
        memo = undefined

    unless memo
      memo = @_memos[key] = {
        hash: hash
        fn: memoize ((next) =>
          fn next
        ), options or {}
      }

    memo.fn next


  ###
  ###

  replace: (key, hash) ->
    return unless @_memos[key]
    @_memos[key] = hash


module.exports = MemoDictionary