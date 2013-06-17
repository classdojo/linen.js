Schema  = require "./schema"
Schemas = require "./schemas"

class Linen
  
  ###
  ###

  constructor: (options = {}) ->
    @schemas   = new Schemas @
    @transport = options.transport

  ###
  ###

  getSchema: (schemaName)    -> @schemas.get schemaName
  addSchema: (schemaOptions) -> @schemas.add schemaOptions

  ###
  ###

  model      : (schemaName) -> @schemas.model schemaName
  collection : (schemaName) -> @schemas.collection schemaName




module.exports = () -> new Linen()
