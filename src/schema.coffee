Model        = require "./model"
Field        = require "./field"
controllers  = require "./field/controllers"

###
###

class Schema
  
  ###
  ###

  constructor: (definition, @name, @service) ->

    # create the field
    @field = new Field definition
    @field.schema  = @
    @field.service = @service

    # only need to be concerned with the root controller, since this is the only entry
    # point
    @_rootFieldController = controllers.transporter @field

  ###
  ###

  model: (data = {}, options = {}) ->
    m = new Model @
    @_rootFieldController.prepareModel m, data, options
    m

  ###
  ###

  collection: (data = {}, options = {}) ->


module.exports = (definition, name, service) -> new Schema(definition, name, service)