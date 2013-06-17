
###

schema = 
  route: "/classrooms"
  fields: 
    name: "string"
    students: [
      $ref: "student"
      $fetch:
        route: ["@route", ":_id/students"]
    ]
    archived:
      $type: "string"
      $fetch: 
        put: [
          {
            test: (value) -> value is true
            route: ["@route", ":_id/archive"]
          },
          {
            test: 
              method: (value) -> value is false
            route: ["@route", ":_id/unarchive"]
          }
        ]

classroomSchema = linen.schema "classroom", schema

# /classrooms/someId
classroom = linen.model("classroom", "someId")

# /classrooms/someId/students
classroom.get("students")

# put /classrooms/somId/archive
classroom.set("archived", true)

###


Fields     = require "./fields"
bindable   = require "bindable"
Model      = require "./model"
Collection = require "./collection"
type       = require "type-component"


class Schema extends bindable.Object

  ###
  ###

  __isSchema: true
  
  ###
  ###

  constructor: (@linen, options = {}) ->

    # name of the schema
    @name = options.name

    # the route for fetching individual objects
    @route = options.route

    # fields for 
    @_setFields options.fields or {}
    @_addDefaultFields()

  ###
  ###

  save: (model, next) ->
    @validate model, (err) ->
      return next(err) if err?
      changed = model.flushChanged()

  ###
  ###

  validate: (model, next) ->
    next @_fields.validate model

  ###
  ###

  model: (data) ->
    d = {}

    if type(data) is "string"
      d._id = data
    else
      d = data or {}


    # return the new model, along with the
    # correct, mapped data
    new Model @, @_fields.map d

  ###
  ###

  field: (name) -> @_fields.get(name)

  ###
  ###

  collection: () ->

  ###
  ###

  _setFields: (options) ->
    @_fields = new Fields @
    @_fields.addFields options


  ###
  ###

  _addDefaultFields: () ->
    @_fields.addFields 
      _id: "string"



module.exports = Schema

