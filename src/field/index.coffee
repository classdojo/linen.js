normalize = require "./normalize"

###
 describes the skeleton of what the capabilities are of a particular
 model - doesn't actually do anything except store options
###

class Field
  
  ###
  ###

  constructor: (@options) ->

    # name of this field
    @name = options.name

    # path to this field
    @path = (options.path or []).join(".")

    # parent field
    @parent = @options.parent

    # add the children
    @_setFields options.fields

  ###
   gets the field based on the given path - passed to another method
   that's a bit more
  ###

  getField: (path, closest = false) -> @_getField path.split("."), 0, closest

  ###
    returns all fields
  ###

  flatten: () -> @_flatten []

  ###
  ###

  _flatten: (fields) ->
    fields.push @
    field._flatten(fields) for field in @fields
    fields

  ###
  ###

  _getField: (path, index, closest) ->

    if index is path.length
      return @

    name = path[index]
    field = @_fieldsByName[name]

    if !field
      if closest
        return @
      else
        return undefined


    field._getField(path, index + 1, closest)

  ###
  ###

  _setFields: (fields) ->

    @fields        = []
    @_fieldsByName = {}

    for fieldName of fields
      @addField fieldName, fields[fieldName]

  ###
   adds a sub field to this field
  ###

  addField: (fieldName, options) ->

    options.parent = @
    options.path   = (@options.path or []).concat fieldName
    options.name   = fieldName

    @fields.push field = new Field options
    @_fieldsByName[field.name] = field


module.exports = (options = {}) -> new Field normalize options