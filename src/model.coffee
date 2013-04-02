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

      @_request request, outcome.e(next).s (result) =>
        @hydrate result
        next null, @

    ###
    ###

    _request: (options, next) ->
      options.item = @
      linen.resource.request options, next
      @


    ###
    ###

    save: cstep (next) ->
      @validate outcome.e(next).s () =>
        if @isNew()
          @_request { method: "POST", data: @_update }, next
        else
          @_request { method: "PUT", data: @_update }, next

    ###
    ###

    remove: cstep (next) ->
      return next(new Error("cannot remove a new item")) if @isNew()
      @_request { method: "DELETE" }, next


