class InheritFetch extends require("./base")
  
  ###
  ###

  fetch: (payload, next) -> 

    # cannot POST a property that's inheriting 
    return next() if not @field.parent or payload.method isnt "get"
    
    @field.parent.fetch payload, next



module.exports = InheritFetch