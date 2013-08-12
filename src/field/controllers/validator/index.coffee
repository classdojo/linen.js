class Validator extends require("../base")
  
  ###
  ###

  name: "validator"
  
  ###
  ###

  validate: (model, next) -> next()

  ###
  ###

  prepareModel: (model, data) ->

    # mixin the validate method
    model.validate = (next) =>
      @validate model, next

  ###
  ###

  _createFieldDecorator: (field) ->


module.exports = (rootField) -> new Validator rootField