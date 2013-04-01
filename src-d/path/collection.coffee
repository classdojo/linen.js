bindable = require "bindable"
_ = require "underscore"
outcome = require "outcome"


module.exports = class extends bindable.Collection

  ###
  ###

  constructor: (@_route, @query = {}) ->
    @_o = outcome.e @

    # cast each item as this particular data-type
    @transform().cast(@_route.modelBuilder.getClass())

  ###
  ###

  url: () -> @_route.collectionUrl()

  ###
   fetches the current data for this collection
  ###

  fetch: (query) -> 

    if arguments.length
      @query = query

    @_fetch()

  ###
   override bind so that _fetch is called periodically
  ###

  bind: () ->
    @__super__.bind.apply this, arguments
    @_fetch()

  ###
   _fetches results from the server, but throttles the number of requests
   sent at any given point
  ###

  _fetch: _.throttle (() ->
    @_route.fetch query, @_o.s (result) -> @_update result
  ), 1000 * 10

  ###
  ###

  _update: (item) ->  
  
    # note that indexOf is based on the ID of the item, not the reference to the object
    if ~(index = @indexOf item)
      @at(index).update item

    #also note that we can physically push this 
    else
      @push item

