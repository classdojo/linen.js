bindable = require "bindable"

class Collection extends bindable.Collection
  
  ###
  ###

  __isCollection: true
  
  ###
  ###

  constructor: (@field) ->
    super()

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
    @field.fetch @, next

  ###
  ###

  save: () ->






module.exports = Collection