type = require "type-component"

class DefaultVirtual extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field
    @_createDefault = @_getDefaultFn field.options.default
  
  ###
  ###

  fetch: (model, next) -> 

    # skip if the value is new, or 
    return next() if model.get(@field.path)? or !model.isNew()

    # async?
    if @_createDefault.length is 1 
      @_createDefault (err, value) =>
        if err 
          return console.error err
        model.set @field.path, value
        next()

    #sync?
    else
      model.set @field.path, @_createDefault()
      next()

  ###
  ###

  _getDefaultFn: (def) ->
    if type(def) is "function"
      return def
    return () -> def

  ###
  ###

  @test: (field) -> field.options.default


module.exports = DefaultVirtual