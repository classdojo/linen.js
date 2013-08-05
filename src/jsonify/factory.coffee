Reference = require("./reference")
JSONifier = require("./jsonify")

module.exports = (field) ->

  if field.options.ref
    return new Reference field

  return new JSONifier field