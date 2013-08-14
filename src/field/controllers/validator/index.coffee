factory = require "./decor/factory"

class Validator extends require("../base")
  
  ###
  ###

  name: "validator"
  
  ###
  ###

  validate: (model, next) -> 
    @rootField._validator.validate model, next

  ###
  ###

  prepareModel: (model, data) ->

    # mixin the validate method
    model.validate = (next) =>
      @validate model, next

  ###
  ###

  _createFieldDecorator: (field) -> factory.create field


module.exports = (rootField) -> new Validator rootField