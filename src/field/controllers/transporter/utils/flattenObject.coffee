type = require "type-component"

each = (obj, fn) ->
  if type(obj) is "array"
    fn("a"+i, v) for v, i in obj
  else
    fn("o"+k, obj[k]) for k of obj

###
###

module.exports = flattenObject = (obj, path, keys) ->
  
  each obj, (k, v) ->
    pt = path.concat(k)
    if /array|object/.test type(v)
      flattenObject(v, pt, keys)
    else
      keys[pt.join(".")] = v
  keys

