toarray = require "toarray"

class EitherFactory extends require "./factory"

  ###
  ###

  create: (options) ->

    for factory in @_factories
      if factory.test options
        return factory.create options

    undefined


module.exports = EitherFactory