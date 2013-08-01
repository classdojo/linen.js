tarray = require "toarray"

class AnyFactory extends require "./factory"

  ###
  ###

  create: (option) ->
    items = []

    for factory in @_factories
      if factory.test option
        items = items.concat toarray factory.create options

    items

module.exports = AnyFactory