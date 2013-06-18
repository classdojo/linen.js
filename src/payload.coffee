PayloadData = require "./payloadData"

###
 payload data persisted to the server
###

class Payload

  ###
  ###

  constructor: (@model, @parent) ->

    # only the keys which are defined in the model schema
    # TODO - this should be in the model
    @keys  = @model.flushChanged().map((changed) ->
      changed.key
    ).filter (key) ->
      !!model.schema.fields.get(key)

    @isNew = @model.isNew()

  ###
  ###

  child: (model) -> new Payload model, @

  ###
  ###

  data: (field) -> new PayloadData @, field



module.exports = Payload