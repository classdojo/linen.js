module.exports = class extends require("./base")

  ###
  ###

  init: () ->
    @mapper = @options or (response, callback) -> callback null, response

  ###
  ###

  fetch: (options, callback) ->

    
  
    @mapper options.response, (err, response) ->
      return callback(err) if err
      options.response = response
      callback null, options.response

    callback()

