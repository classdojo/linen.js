AnyFactory = require "../../../../factory/any"

module.exports = new AnyFactory [
  require("./transport"),
  require("./inherit"),
  require("./none")
]