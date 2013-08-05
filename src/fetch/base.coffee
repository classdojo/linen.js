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


module.exports = BaseFetcher