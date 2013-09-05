type = require "type-component"

class TypeValidator extends require("./base")
  
  validate: (model, next) ->

    value = model.get(@field.path)
    return next() unless value?
    t = type(value)


    valid = t is @field.options.type

    # need to perform additional checks to make sure it's the correct type
    switch t
      when "number" then valid = valid and !isNaN(value)
      when "string" then valid = true
      
    unless valid
      next new Error "#{@field.path} must be a #{@field.options.type}"
    else
      next()


  @test: (field) -> 
    field.options.type

module.exports = TypeValidator