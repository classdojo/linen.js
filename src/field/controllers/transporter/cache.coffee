flattenObject = require "./utils/flattenObject"
unflattenObject = require "./utils/unflattenObject"

class Cache

  ###
  ###

  constructor: () ->
    @_data = {}

  ###
  ###

  clear: () ->  
    @_data = {}
    @

  ###
  ###

  store: (data) ->
    newData = flattenObject { v: data }, [], {}

    for key of newData
      @_data[key] = newData[key]

    @


  ###
  ###

  pluck: (data, store) ->
    compData = flattenObject { v: data }, [], {}

    changedData = {}

    for key of compData

      # fuck you coffeescript for changing == to ===
      # forces coffeescript to interpret this has javascript. Works
      # for comparisons such as 3 == "3". This is necessary.
      if `this._data[key] == compData[key]`
        continue

      changedData[key] = compData[key]

    changed = unflattenObject(changedData)?.v

    if store
      @store changed

    changed




module.exports = Cache
