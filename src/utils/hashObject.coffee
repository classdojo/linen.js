type = require "type-component"
_    = require "underscore"

###
###

each = (obj, fn) ->
  if type(obj) is "array"
    fn("a"+i, v) for v, i in obj
  else
    fn("o"+k, obj[k]) for k of obj

###
###

flattenObj = (obj, path, keys) ->
  each obj, (k, v) ->
    pt = path.concat(k)
    if /array|object/.test type(v)
      flattenObj(v, pt, keys)
    else
      keys[pt.join(".")] = v
  keys

###
###

module.exports = (obj) ->
  keys = flattenObj({v:obj}, [], {})
  hash = []
  for k of keys
    hash.push k, keys[k]
  hash.join(":")


  