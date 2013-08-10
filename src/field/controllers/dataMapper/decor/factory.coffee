AnyFactory = require "../../../../factory/any"

module.exports = new AnyFactory [
  require("./default"),
  require("./fn"),
  require("./reference"),
  require("./none")
]