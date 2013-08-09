Model        = require "./model"
Field        = require "./field"
controllers  = require "./field/controllers"

###
###

class Schema
  
  ###
  ###

  constructor: (definition, @service) ->

    # create the field
    @field = new Field definition

    # only need to be concerned with the root controller, since this is the only entry
    # point
    @_rootFieldController = controllers.initialize(@field, @_createFieldController)
    @_rootFieldController = @field.controller

  ###
  ###

  model: (data = {}, options = {}) ->
    m = new Model()
    @_rootFieldController.initializeModel m, data, options
    m

  ###
  ###

  collection: (data = {}, options = {}) ->

  ###
  ###

  _createFieldController: (field) -> new controllers.Transporter field




module.exports = (definition, service) -> new Schema(definition, service)