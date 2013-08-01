type = require "type-component"

class DefaultMapper extends require("./base")

  ###
  ###

  constructor: (schema) ->
    super schema
    @_createDefault = @_getDefaultFn schema.options.default
  
  ###
  ###

  get: (model, value) -> 
    return if value?

    if model.isNew()


      # async?
      if @_createDefault.length is 1 
        @_createDefault (err, value) =>
          if err 
            return console.error err
          model.set @schema.path, value

      #sync?
      else
        model.set @schema.path, @_createDefault()

    else
      @schema.fetch model

  ###
  ###

  _getDefaultFn: (def) ->
    if type(def) is "function"
      return def
    return () -> def

  ###
  ###

  @test: (schema) -> schema.options.default



module.exports = DefaultMapper