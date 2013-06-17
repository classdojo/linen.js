Fields   = require "./fields"
Virtuals = require "./virtuals"
Mapper   = require "./mapper"
Model    = require "./model"

###
 new Schema
  
  # auto persist the model
  auto: true

  fields:
    name: "string"
    address: { $ref: "address" }

  virtuals:
    address:
      get: (model, next) ->
      set: (model, next) ->
      fetch: (options, next) ->

  # GET, POST, DELETE, PUT
  fetch: (options, next) ->
###

class Schema

  ###
  ###

  constructor: (options) ->


    # virtual keys 
    @virtuals = new Virtuals options.virtuals or {}

    @mapper    = new Mapper options.map or {}

    # fields used to validate the model
    @_fields = new Fields options.fields, @mapper

    # method used to persist information the backend
    @_save     = options.save or () ->
    @_get      = options.get or () ->

  ###
  ###

  model: (_id) -> new Model @, { _id: _id }

  ###
  ###

  validate: (model, callback) -> @_fields.validate(model, callback)

  ###
   fetches a model
  ###

  fetch: (model, callback) -> 
    @_fetch "GET", model, callback

  ###
  ###

  save: (model, callback = ()->) ->
    method = if model.isNew() then "POST" else "PUT"

    options = {}

    if method is "PUT"
      options.data   = model.flushChanges()
      model.data._id = model.get("_id")
    else
      options.data   = model.toObject()


    @_fetch method, model, callback


  ###
   removes the model
  ###

  del: (model, callback = ()->) ->
    return callback(new Error("model isn't new")) unless model.isNew()
    method = "DELETE"

    options = 

    @_fetch method, 

  ###
  ###

  _fetch: (options, callback = () ->) ->



module.exports = Schema