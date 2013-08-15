AnyFactory = require "../../../../factory/any"
GroupFactory = require "../../../../factory/group"

module.exports = new AnyFactory [ 
  new GroupFactory([
    require("./type"),
    require("./required"),
    require("./sub"),
  ], [], require("./group")),
  require("./none")
]