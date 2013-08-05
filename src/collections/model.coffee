bindable = require "bindable"

class ModelCollection extends bindable.Collection
  __collectionType: "model"

module.exports = ModelCollection