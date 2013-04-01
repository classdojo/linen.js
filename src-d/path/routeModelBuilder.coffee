Collection = require "./collection"
outcome = require "outcome"
_ = require "underscore"
dref = require "dref"

module.exports = class 
  
  ###
  ###

  constructor: (@route) ->
    @_modelBuilder = @route.schema.modelBuilder
    @_setup()


  ###
  ###

  _setup: () ->
    mb = @_modelBuilder
    route = @route
    mb.createCollection = @_createCollection

    # must be validated before saving
    mb.pre ["save"], (next) ->
      this.validate next

    mb.methods.bind = () ->
      @__super__.bind.apply this, arguments
      # check last fetch time. If stale, then fetch
      @

    # GET the model
    mb.methods.fetch = (next) ->
      @_sync "GET", next

    mb.methods.set = (key, value) ->
      if not @_update
        @_update = {}

      # set the new updated data
      dref.set @_update, key, value

      @__super__.apply this, arguments


    # returns TRUE if this object is new
    mb.methods.isNew = () -> not @get "_id"

    # synchronizes changes with the remote object
    mb.methods._sync = (method, query, next) ->

      if arguments.length is 2
        next = query
        query = {}

      q = _.extend { }, (query or {}), { _id: @get("_id") } 

      route.fetch { method: method, query: q }, outcome.e(next).s (result) =>
        @set result or {}
        next()
      @


    # POST/PUT the model
    mb.pre "save", (next) ->

      # no _id? it's new!
      if @isNew()
        @_fetch "POST", @get(), next

      # otherwise, check if there is new data to save. 
      else if _.keys(@_update).length

        # only put the attributes that have changed
        @_fetch "PUT", @_update, next

        # reset the items to save
        @_update = {}

      # otherwise skip save
      else
        next()




    # DELETE the model
    mb.pre "remove", (next) ->

      # return an error if the item saved is a new item
      return next(new Error("cannot remove a new item")) if @isNew()

      # delete the item
      @_fetch "DELETE", next






  ###
  ###

  _createCollection: () =>
    new Collection(@route)


