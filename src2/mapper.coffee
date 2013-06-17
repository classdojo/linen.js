hoist = require "hoist"

class Mapper
  
  ###
  ###

  constructor: (@_maps = {}) ->
    @_initMaps()

  ###
  ###

  map: (key, value) -> @_maps[key]?(value) or value


  ###
  ###

  _initMaps: () ->
    for name of @_maps
      @_maps = hoist.map @_maps[name]


  ###
  ###

  add: (key, map) ->
    oldMap = @_maps[key]
    @_maps[key] = newMap = hoist.map map
    if oldMap
      hoist.map oldMap

module.exports = Mapper