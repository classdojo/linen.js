bindable = require "bindable"

class ModelCollection extends bindable.Collection

  ###
  ###

  constructor: (@field, @owner) ->
    super()

    @transform().map (v) => 
      @field._refMapper.map @owner, v

    @on 
      insert: @_onInsert
      remove: @_onRemove

  ###
  ###

  clear: () ->
    for item in @source().concat()
      item.remove()

  ###
  ###

  model: (data = {}) ->
    model = @field._refMapper.map @owner, data
    model.once "save", () => @push model
    model

  ###
  ###

  reset: (src) ->

    src2 = src.concat()
    esrc = @source().concat()
    
    # update existing
    for existingItem in esrc
      for newItem, i in src
        if @_compare existingItem, newItem
          if @field.options.ref
            existingItem.set newItem
            src.splice i, 1
          break

    # remove old item
    for existingItem, i in esrc
      found = false
      for newItem in src2
        if @_compare existingItem, newItem
          found = true
          break

      unless found
        @splice i, 1

        
    # insert the reset
    @push(item) for item in src

  ###
  ###

  _compare: (a, b) ->
    aid = a.get("_id")
    return (aid is b._id) or (aid is b)

  ###
  ###

  _onInsert: (model) =>
    model.once "remove", () =>
      @remove model

  ###
  ###

  _onRemove: (model) =>


module.exports = ModelCollection