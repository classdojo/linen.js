Schema     = require "./schema"
Schemas    = require "./schemas"
transports = require "./transports"

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

  model      : (schemaName, data, owner) -> @schemas.model schemaName, data, owner



module.exports = () -> new Linen()
module.exports.transports = transports 
