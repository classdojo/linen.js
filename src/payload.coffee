class Payload
  
  ###
  ###

  constructor: (@options = {}) ->

  ###
  ###

  method: (method) -> 
    @options.method = method
    @

  ###
  ###

  model: (model) -> 
    @options.model = model
    @

  ###
  ###

  body: (body) -> 
    @options.body = body
    @

  ###
  ###

  params: (params) -> 
    @options.params = params
    @

  ###
  ###

  query: (query) -> 
    @options.query = query
    @

  ###
  ###

  toObject: () -> @options


exports.model = (model)  -> new Payload().model(model)