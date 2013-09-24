factories = require "factories"

GroupMapper = require("./group")
SubMapper   = require("./sub")
Caster      = require("./cast")

###
  new GroupFactory([require("./default")], [SubMapper], GroupMapper),
  new GroupFactory([require("./fn")], [SubMapper], GroupMapper),
###

module.exports = factories.any [
  factories.group([require("./default")], [Caster, SubMapper], GroupMapper),
  factories.group([require("./fn")], [Caster, SubMapper], GroupMapper),
  require("./refCollection"),
  require("./collection"),
  require("./reference"),
  require("./virtual"),
  require("./sub"),
  factories.group([Caster], [SubMapper], GroupMapper),
  require("./none")
]