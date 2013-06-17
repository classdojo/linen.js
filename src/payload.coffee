###
 payload data persisted to the server
###

class Payload

  ###
  ###

  constructor: (@model, @parent) ->
    @keys  = @model.flushChangedKeys()
    @isNew = @model.isNew()


  ###
  ###

  removeKey: (key) ->
    i = @keys.indexOf key
    if ~i
      @keys.splice i, 1

  ###
  ###

  pluck: () ->


  ###
  ###

  child: (model) -> new Payload model, @



module.exports = Payload