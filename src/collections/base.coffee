flatstack = require("flatstack")

class BaseLinenCollection extends require("bindable").Collection
    
  ###
  ###

  constructor: (@field) ->
    super()

    @_callstack = flatstack()

    @on 
      insert : @_persistInsert
      remove : @_persistRemove
      reset  : @_persistReset

  ###
  ###

  clear: () -> @source []

  ###
  ###

  _watching: (property) ->

  ###
  ###

  _persistInsert: (model) ->

  ###
  ###

  _persistRemove: (model) ->

  ###
  ###

  _persistReset: () ->



module.exports = BaseLinenCollection