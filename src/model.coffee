dref = require "dref"
outcome = require "outcome"
cstep = require "cstep"
asyngleton = require "asyngleton"
_ = require "underscore"

module.exports = (builder, Model) ->

  linen = builder.linen
  
  class LinenModel extends Model

    constructor: (data = {}) ->

      # id MAYBE a string - which is an _id. If this is the case, then
      # handle it accordingly
      if typeof data is "string"
        data = { _id: data }
      else
        data = data

      @_o = outcome.e @
      super data
      @_setupRefs()
      this._update = {}


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
     Hydrates the data and compares the current data to make sure this shit doesn't get overridden.
    ###

    hydrate: (data) ->
      for key of data 
        cv = @get key
        nv = data[key]

        # is it a bindable it? it's a sub-schema item.
        if cv 
          if cv.__isBindable
            cv = cv.get("_id")

          # is it a collection? skip
          else if cv.__isCollection
            delete data[key]
            continue

        # no change? don't replace
        # TODO - might need do deep compare with objects
        if cv is nv
          delete data[key]

      @set data
      @_update = {}
      @

    ###
    ###

    isNew: () -> not @get "_id"

    ###
    ###

    get: () ->
      @_initFetch()
      LinenModel.__super__.get.apply @, arguments

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

    _initFetch: () ->
      return if @_fetched
      @_fetched = true
      @fetch()

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

        continue if not ref

        if not ref?.options.$objectKey
          v = data[key]
        else
          v = dref.get data[key], ref.options.$objectKey

        d[key] = v

      @_toJSON d

    ###
    ###

    save: (next = (() ->)) ->
      o = @_o.e next
      @validate o.s () =>
        if @isNew()
          # body = this since we're using toJSON()
          @_request { method: "POST", body: @ }, o.s () =>
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

      @_request { method: "DELETE" }, outcome.e(next).s () =>
        @removed = true
        @emit "remove"
        @dispose()
        next()

      @


