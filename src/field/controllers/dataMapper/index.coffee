AnyFactory = require "../../../factory/any"

mapperFactory = new AnyFactory [
  require("./root"),
  require("./default"),
  require("./none")
]


module.exports = (field) -> 
  mapper = mapperFactory.create(field)