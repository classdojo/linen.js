ClassFactory = require "./class"
type         = require "type-component"
FnFactory    = require "./fn"

class FactoryFactory extends require("./base")

  ###
  ###

  constructor: () ->

  ###
  ###

  create: (data) ->

    if (t = type(data)) is "function"
      if data.prototype.constructor
        if data.create and data.test  
          return data
        else
          return new ClassFactory data
      return new FnFactory data

    return data


module.exports = new FactoryFactory()