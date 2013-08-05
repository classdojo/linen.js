bindable = require "bindable"

class PrimitiveCollection extends bindable.Collection
  __collectionType: "simple"

module.exports = PrimitiveCollection