factories = require "factories"

module.exports = factories.any [
  require("./transport"),
  require("./inherit"),
  require("./none")
]