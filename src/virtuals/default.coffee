type = require "type-component"

class DefaultVirtual extends require("./base")

  ###
  ###

  constructor: (schema) ->
    super schema
    @_createDefault = @_getDefaultFn schema.options.default
  
  ###
  ###

  fetch: (model, next) -> 

    # skip if the value is new, 
    return next() if model.get(@schema.path)? or !model.isNew()

    # async?
    if @_createDefault.length is 1 
      @_createDefault (err, value) =>
        if err 
          return console.error err
        model.set @schema.path, value
        next()

    #sync?
    else
      model.set @schema.path, @_createDefault()
      next()

  ###
  ###

  _getDefaultFn: (def) ->
    if type(def) is "function"
      return def
    return () -> def

  ###
  ###

  @test: (schema) -> schema.options.default


module.exports = DefaultVirtual