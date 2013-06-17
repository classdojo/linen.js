class Virtual

  ###
  ###

  constructor: (method, options) -> 
    @get   = options.get
    @set   = options.set
    @fetch = options.fetch




class Virtuals
  
  ###
  ###

  constructor: (virtuals) ->
    @_virtuals = []
    for virtual in virtuals
      @_virtuals.push new Virtual virtual

  ###
  ###

  hasGetter: (key) -> !!@_virtuals[key]?.get

  ###
  ###

  get: (model, key) -> @_virtuals[key].get.call model, key

  ###
  ###

  hasSetter: (key) -> !!@_virtuals[key]?.set

  ###
  ###

  set: (model, key) -> @_virtuals[key].set.call model, key

  ###
  ###

  hasFetch: (key) -> !!@_virtuals[key]?.fetch

  ###
  ###

  fetch: (key, options, next) -> @_virtuals[key].fetch options, next



module.exports = Virtuals