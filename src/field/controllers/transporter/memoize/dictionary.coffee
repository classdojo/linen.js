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

  ###
  ###

  replaceHash: (oldKey, newKey) -> 
    @_memos[newKey] = @_memos[oldKey]

    if oldKey isnt newKey
      delete @_memos[oldKey]



module.exports = MemoDictionary