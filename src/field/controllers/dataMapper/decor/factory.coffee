AnyFactory = require "../../../../factory/any"

module.exports = new AnyFactory [
  require("./default"),
  require("./fn"),
  require("./refCollection"),
  require("./collection"),
  require("./reference"),
  require("./virtual"),
  require("./none")
]