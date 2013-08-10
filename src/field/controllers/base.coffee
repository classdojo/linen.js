###

field = new Field {
  name: "string",
  address: {
    $type: "object"
    $validate: ["DO STUFF, DOOOOO STUFF!!!"]
  }
}

# validator controller takes on a field, and validates it against
a model
validator = new Validator field

###

class BaseFieldController

  ###
  ###

  constructor: (@rootField) ->

    unless @name
      throw new Error "cannot create field controller without a name"

    # setup all sub fields to contain a field decorator
    @rootField.allFields.forEach (field) =>
      field["_" + @name] = @_createFieldDecorator field

  ###
  ###

  prepareModel: (model, data) ->

  ###
  ###

  _createFieldDecorator: (field) ->

module.exports = BaseFieldController