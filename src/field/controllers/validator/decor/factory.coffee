factories = require "factories"

module.exports = factories.any [ 
  factories.group([
    require("./type"),
    require("./required"),
    require("./sub"),
  ], [], require("./group")),
  require("./none")
]