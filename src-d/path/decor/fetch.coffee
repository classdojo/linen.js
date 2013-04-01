request = require("request")

module.exports = class extends require("./base")

  ###
  ###

  init: () ->
    @host = @options.host

  ###
  ###

  fetch: (options, callback) ->
    request



