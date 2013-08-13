flattenObject = require "./utils/flattenObject"
unflattenObject = require "./utils/unflattenObject"

class Cache

  ###
  ###

  constructor: (@model) ->
    @_data = {}

  ###
   this is more of an optimization - primes the 
   caches before persisting - only necessary if the model
   is being fetched a remote service
  ###

  storeModel: () ->
    return if @_prepared
    @_prepared = true

    # cache the data so it doesn't get persisted to the server. 
    # an explicit reference might be defined, so convert to an object
    @store @model.normalize()

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
      if @_data[key] is compData[key]
        continue

      changedData[key] = compData[key]

    changed = unflattenObject(changedData)?.v

    if store
      @store changed

    changed




module.exports = Cache
