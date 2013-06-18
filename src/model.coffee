bindable = require "bindable"
_ = require "underscore"
Payload = require "./payload"

class Model extends bindable.Object 

  ###
  ###

  __isModel: true

  ###
  ###

  constructor: (@schema) ->
    super {}
    @_changed = {}

  ###
  ###

  isNew: () -> not @has "_id"

  ###
  ###

  hasChanged: () -> !!Object.keys @_changed

  ###
  ###

  changed: () -> @_changed

  ###
  ###

  changedToArray: () ->
    cha = []
    for key of @_changed
      cha.push @_changed[key]
    cha

  ###
  ###

  _set: (key, value) ->
    super key, @schema.map key, value

  ###
  ###

  flushChanged: () ->
    ch = @_changed
    @_changed = {}
    changed = []
    for key of ch
      changed.push ch[key]
    changed

  ###
   refreshes the model
  ###

  fetch: (next) -> @_fetch new Payload(@, "GET"), next

  ###
   saves the model - either adds it as a new one, or updates it
  ###

  save: (next)  -> @_fetch new Payload(@, (if @isNew() then "POST" else "PUT"), @flushChanged()), next

  ###
   removes the model
  ###

  remove: (next) -> 
    @_fetch new Payload(@, "DELETE"), (err) =>
      return next(err) if err?
      @emit "delete"

  ###
   calls .fetch() on schema, and updates this model
  ###

  _fetch: (payload, next = () ->) ->
    @schema.fetch payload, (err, result) =>
      return err if err?

      # result must always be the updated model
      @set result or {}
      next()


  ###
   on binding, fetch this model, but don't do it all the time.
  ###

  bind: (property) ->
    binding = super arguments...
    return binding if @_ignoreFetch
    @_throttledFetch()
    binding

  ###
  ###

  validate: (next) -> 
    error = @schema.validate @
    if arguments.length is 1
      next error
    else
      return error

  ###
  ###

  _throttledFetch: _.throttle (() ->  
    @fetch()
  ), 1000 * 5


  ###
  ###

  _bindFields: () ->
    @_ignoreFetch = true
    for field in @schema.fields.toArray() then do (field) =>

      fieldName = field.property
      fops      = field.options

      @bind(fieldName).to (newValue, oldValue) => 
        @_changed[fieldName] = { key: fieldName, nv: newValue, ov: oldValue }
        if fops.set
          fops.set @, newValue, oldValue

      if fops.get
        @set field.property, fops.get @

      if fops.bind
        for property in fops.bind then do (property) =>
          @bind(property).to () =>
            @set fieldName, fops.get @

    @_ignoreFetch = false


module.exports = Model