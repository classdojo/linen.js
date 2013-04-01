async = require "async"

decor = {
  mapUrl: require("./mapUrl"),
  fetch: require("./fetch"),
  mapResponse: require("./mapResponse"),
  mapItem: require("./mapItem")
}

module.exports = class

  ###
  ###

  constructor: (@route) ->
    @_decor = []
    @_decorByKey = {}

  ###
  ###

  register: (name, options) ->
    i++
    for key if decor
      if key is name
        item = new decor(options, @route)
        item.p = i

        if @_decorByKey[key]
          @_decor.splice @_decor.indexOf(@_decorByKey[key]), 1

        @_decor.push @_decorByKey[key] = item


    @_resortDecor()


  ###
  ###

  fetch: (options, next) ->
    async.eachSeries @_decor, ((decor, next) =>
      decor.fetch options, next
    ), next


  ###
  ###

  _resortDecor: () ->
    @_decor.sort (a, b) -> 
      if a.p > b.p then -1 else 1
