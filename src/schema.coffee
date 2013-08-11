Model        = require "./model"
Field        = require "./field"
controllers  = require "./field/controllers"

###
###

class Schema
  
  ###
  ###

  constructor: (definition, @name, @service) ->

    # create the field, and attach the schema / service
    # so that sub fields have a reference to them by accessing
    # field.root.schema, or field.root.service. 
    definition._id = "string"
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