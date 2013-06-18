class PayloadData
  
  ###
  ###

  constructor: (@payload, @keys = []) ->
  
    v = {}
    if @keys.length
      for key in keys
        v[key] = payload.model.get key
    else
      v = payload.model.get()

    @value = v


module.exports = PayloadData