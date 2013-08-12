AnyFactory   = require "../../../../factory/any"
GroupFactory = require "../../../../factory/group"

GroupMapper = require("./group")
SubMapper   = require("./sub")
Caster      = require("./cast")

###
  new GroupFactory([require("./default")], [SubMapper], GroupMapper),
  new GroupFactory([require("./fn")], [SubMapper], GroupMapper),
###

module.exports = new AnyFactory [
  new GroupFactory([require("./default")], [Caster, SubMapper], GroupMapper),
  new GroupFactory([require("./fn")], [Caster, SubMapper], GroupMapper),
  require("./refCollection"),
  require("./collection"),
  require("./reference"),
  require("./virtual"),
  require("./sub"),
  new GroupFactory([Caster], [SubMapper], GroupMapper),
  require("./none")
]