class Payload
  
  ###
  ###

  constructor: () ->
    @data = {
      changed: []
    }

  ###
  ###

  changed: (changed) ->
    data = {}
    for cv in changed
      data[cv.key] = cv.nv

    @data.data = data
    @data.changed = changed
    @

  ###
  ###

  method: (method) ->
    @data.method = method
    @

  ###
  ###

  collection: (collection) -> 
    @data.collection = collection
    @model collection.owner

  ###
  ###

  model: (model) -> 
    @data.model = model
    @data.data   = model.toJSON()
    @
    
  ###
  ###

  target: (model) ->
    @data.target = model
    @data.data   = model.toJSON()
    @

  ###
  ###

  toJSON: () -> @data


Object.keys(Payload.prototype).forEach (method) ->
  exports[method] = (value) -> 
    p = new Payload()
    p[method].call p, value

