class Payload
  
  ###
  ###

  constructor: (@target, @method, @changed = {}) ->
    @data = {}
    for key of changed
      @data[key] = changed.nv


module.exports = Payload