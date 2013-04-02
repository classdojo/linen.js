dref = require "dref"
outcome = require "outcome"
cstep = require "cstep"
asyngleton = require "asyngleton"
_ = require "underscore"

module.exports = (builder, Model) ->

  linen = builder.linen
  
  class extends Model

    ###
    ###

    _initData: (data) ->

      @_o = outcome.e @


      # id MAYBE a string - which is an _id. If this is the case, then
      # handle it accordingly
      if typeof data is "string"
        data = { _id: data }
      else
        data = data

      super data

    ###
    ###

    route: (options) ->
      if arguments.length
        @_route = _.extend @_route or {}, options
        return @

      _.extend {}, @_route, @definition?.options.$route or {}

    ###
    ###

    _set: (key, value) ->
      super key, value

      # set the properties that have changed
      if not @_update
        @_update = {}

      dref.set @_update, key, value

    ###
    ###

    hydrate: (key, value) ->
      @set.apply @, arguments
      @_update = {}
      @

    ###
    ###

    isNew: () -> not @get "_id"

    ###
    ###

    fetch: asyngleton true, (next) ->
      request = {
        method: "GET",
        item: @
      }

      return next new Error("cannot fetch new model") if @isNew()

      @_request request, next

    ###
    ###

    _request: cstep (options, next) ->
      options.item = @

      # if the model parent is NOT a collection, then set the collection to null.
      options.collection = if @parent?.length then @parent else null
      options.one = true
      linen.resource.request options, outcome.e(next).s (result) =>
        @hydrate result
        next()
      @

    ###
    ###

    save: (next) ->
      o = @_o.e next
      @validate o.s () =>
        if @isNew()
          @_request { method: "POST", body: @_update }, o.s () =>
            @parent.pushNoPersist @
            next.call @
        else
          @_request { method: "PUT", body: @_update }, next

      @

    ###
    ###

    remove: (next = (() ->)) ->
      if @isNew()
        next new Error "cannot remove a new item"
        return @

      @_request { method: "DELETE" }, next
      @


