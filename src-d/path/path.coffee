Path = require "./path"

module.exports = class

  ###
  ###

  constructor: (@linen, @options = {}) ->
    @_paths = {}
  
  ###
  ###

  path: (name) ->
    @_paths[name] or (@_paths[name] = new Path(name, @))
