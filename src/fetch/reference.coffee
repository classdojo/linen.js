class RefFetch extends require("./base")
  
  ###
  ###

  fetch: (payload, next) ->
    ref = payload.model.get @field.path
    return next() unless ref?

    if payload.method is "get"
      ref.load next
    else if /put|post/.test payload.method
      ref.save next
    else
      return next()


module.exports = RefFetch