bindable = require "bindable"
Payload  = require "./payload"

class Collection extends bindable.Collection
  
  ###
  ###

  __isCollection: true
  
  ###
  ###

  constructor: (@field) ->
    super()

    @transform().map (model) ->
      return field.map model




  ###
  ###

  hasChanged: () ->
    for item in @source()
      return true if item.hasChanged()
    return false


  ###
  ###

  fetch: (next = ()->) ->
    return next() unless @field.isVirtual()
    @field.fetch new Payload(@, "GET"), (err, models) =>
      return next(err) if err?
      @__reset models

  ###
  ###

  save: () ->

  ###
  ###

  __reset: (models) -> 
    @source models







module.exports = Collection