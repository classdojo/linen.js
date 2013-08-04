class InheritFetch

  ###
  ###

  constructor: (@field) ->
  
  ###
  ###

  fetch: (payload, next) -> 
    return next() unless @field.parent
    @field.parent.fetch payload, next



module.exports = InheritFetch