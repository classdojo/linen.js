async = require "async"

###
 flattens two requests together
###

module.exports = class extends require("./base")
  
  ###
  ###

  init: () ->

    # classroom.behaviors
    @collectionNames = @options.split(".")



  ###
  ###

  fetch: (options, callback) ->

    routes = @collectionNames.map (collectionName) => @route.linen.route collectionName

    ###
      async routes, (route, next) ->
        
    ###
    #async routes, (route, next) ->
      #route.fetch (options)





  