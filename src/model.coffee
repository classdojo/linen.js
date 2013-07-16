bindable = require "bindable"
_ = require "underscore"
payload = require "./payload"
dref    = require "dref"

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
    super key, @schema.map @, key, value


  ###
  ###

  toJSON: () ->
    data = {}
    for field in @schema.fields.toArray()
      continue if field.isVirtual()
      value = @get(field.property)
      dref.set data, field.property, value?.toJSON?() or value
    data


  ###
  ###

  flushChanged: () ->
    changed = @changedToArray()
    @_changed = {}
    changed

  ###
   refreshes the model
  ###

  fetch: (next) -> 
    return next(new Error("cannot '#{@schema.name}' fetch on a new model")) if @isNew()
    @_fetch payload.model(@).method("GET"), next

  ###
   saves the model - either adds it as a new one, or updates it
  ###

  save: (next = () ->)  -> 
    @_fetch payload.model(@).method(if @isNew() then "POST" else "PUT").changed(@flushChanged()), () =>
      next arguments...
      @emit "save", arguments...


  ###
   removes the model
  ###

  remove: (next = () ->) -> 
    if @isNew()
      return next(new Error("cannot remove a new model"))

    @_fetch payload.model(@).method("DELETE"), (err) =>
      next()
      @emit "remove"

  ###
   calls .fetch() on schema, and updates this model
  ###

  _fetch: (payload, next = () ->) ->
    @schema.fetch payload.data, (err, result) =>
      return next(err) if err?

      # result must always be the updated model
      @set result or {}
      next()
    @


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

  clone: () -> @schema.model @

  ###
  ###

  _bindFields: () ->
    @_ignoreFetch = true
    ignoreVirtuals = {}

    fields   = @schema.fields.toArray()
    vfields  = fields.filter (field) -> field.isVirtual()
    

    for field in fields then do (field) =>
      fieldName = field.property
      fops      = field.options
      @bind(fieldName).to((newValue, oldValue) =>
        # might need to inherit path
        if field.options.ref and newValue
          newValue.owner = @

        if newValue?.__isCollection
          return

        @_changed[fieldName] = { key: fieldName, nv: newValue, ov: oldValue }

        if fops.set
          ignoreVirtuals[fieldName] = 1
          fops.set @, newValue, oldValue
          delete ignoreVirtuals[fieldName]
      ).now()


    for field in vfields then do (field) =>
      fieldName = field.property
      fops      = field.options

      if fops.get
        @set field.property, fops.get @

      if fops.bind
        for property in fops.bind then do (property) =>
          @bind(property).to () =>
            return if ignoreVirtuals[fieldName]
            @set fieldName, fops.get @

    @_ignoreFetch = false


module.exports = Model