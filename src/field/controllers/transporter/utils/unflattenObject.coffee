_unflatten = (data, keys, currentData) ->

  return data unless keys.length

  k    = keys.shift()
  type = k.substr(0, 1)


  unless currentData
    currentData = if type is "a" then [] else {}


  if type is "a"
    currentData.push _unflatten data, keys
  if type is "o"
    nk = k.substr(1)
    currentData[nk] = _unflatten data, keys, currentData[nk]


  currentData


module.exports = (data) ->

  currentData = undefined

  for key of data
    currentData = _unflatten data[key], key.split("."), currentData

  currentData