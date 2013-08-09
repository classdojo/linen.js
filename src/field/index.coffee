normalizeFields = require "./normalize"

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
      @_addField fieldName, fields[fieldName]

  ###
  ###

  _addField: (fieldName, options) ->

    options.parent = @
    options.path   = (@options.path or []).concat fieldName
    options.name   = fieldName

    @fields.push field = new Field options
    @_fieldsByName[field.name] = field





  
module.exports = (rawFields = {}) -> new Field normalizeFields rawFields