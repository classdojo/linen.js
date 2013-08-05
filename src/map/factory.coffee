GetterSetterMap = require "./gs"
DefaultMap      = require "./default"
ReferenceMap    = require "./reference"
NoMap           = require "./none"
FnMap           = require "./fn"
CollectionMap   = require "./collection"

module.exports = (field) ->
  
  if field.options.collection
    return new CollectionMap field
  if field.options.default?
    return new DefaultMap field
  if field.options.get or field.options.set
    return new GetterSetterMap field
  if field.options.map
    return new FnMap field
  if field.options.ref
    return new ReferenceMap field

  new NoMap field

