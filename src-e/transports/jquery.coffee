async = require "async"
# checkout cargo


module.exports = class

  ###
  ###

  constructor: (options = {}) ->
    @options = options

    # either throttle the number of simultaneous connections, or set it to unlimited
    @_cargo = async.cargo @_request, options.maxConnections or 0

  ###
  ###

  request: (options, callback) ->

    # push it to the cargo worker
    @_cargo.push options, callback


  ###
  ###

  _request: (options, callback) =>
    $.ajax({
      method: options.method or "GET",
      data: options.data or {},
      url: options.url,
      dataType: if @options.jsonp then "jsonp" else "json",
      success: (response) -> callback null, response
      error: (response) -> callback response
    })


