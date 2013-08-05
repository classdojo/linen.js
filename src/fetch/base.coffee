class BaseFetcher
  
  ###
  ###

  constructor: (@field) ->

  ###
  ###


  fetch: (payload, next) -> next()
  
  ###
  ###

  toObject: (model, data) -> data

  ###
  ###

  canFetch: () -> true


module.exports = BaseFetcher