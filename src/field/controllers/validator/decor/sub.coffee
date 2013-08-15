async = require "async"

class NoValidator extends require("./base")

  validate: (model, next) ->
    async.forEach @field.fields, ((field, next) ->
      field._validator.validate model, next
    ), next

  @test: (field) -> field.fields.length

module.exports = NoValidator