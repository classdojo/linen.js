dref = require "dref"
outcome = require "outcome"
cstep = require "cstep"
asyngleton = require "asyngleton"
_ = require "underscore"

module.exports = (builder, Model) ->

  linen = builder.linen
  
  class LinenModel extends Model

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

      @_setupRefs()

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

      # call @get(key) since the value might have been transformed into
      # something else
      dref.set @_update, key, @get key

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

    bind: () ->
      @fetch()
      LinenModel.__super__.bind.apply @, arguments

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
      options.one = true
      linen.resource.request options, outcome.e(next).s (result) =>
        @hydrate result
        next()
      @

    ###
    ###

    _refs: () ->
      @schema.refs()

    ###
    ###

    _setupRefs: () -> 
      @_refs = {}
      for ref in @schema.refs()
        @_refs[ref.key] = ref


    ###
     used for converting model objects into savable pieces - mostly for updating data
    ###

    _toObject: (data) ->
      d = {}

      for key of data
        ref = @_refs[key]

        if not ref?.options.$objectKey
          v = data[key]
        else
          v = dref.get data[key], ref.options.$objectKey

        d[key] = v


      d

    ###
    ###

    save: (next) ->
      o = @_o.e next
      @validate o.s () =>
        if @isNew()
          @_request { method: "POST", body: @data }, o.s () =>
            @parent.pushNoPersist @
            next.call @
        else
          @_request { method: "PUT", body: @_toObject(@_update) }, next

      @

    ###
    ###

    remove: (next = (() ->)) ->
      if @isNew()
        next new Error "cannot remove a new item"
        return @

      @_request { method: "DELETE" }, next
      @


