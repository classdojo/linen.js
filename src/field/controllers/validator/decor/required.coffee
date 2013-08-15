class RequiredValidator extends require("./base")

  validate: (model, next) ->  
    value = model.get(@field.path)
    return next() if value?
    next new Error("#{@field.path} is required")

  @test: (field) -> field.options.required

module.exports = RequiredValidator