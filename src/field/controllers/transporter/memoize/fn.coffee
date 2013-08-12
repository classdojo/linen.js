EventEmitter = require("events").EventEmitter

class Emitter

  ###
  ###

  constructor: () ->
    @_listeners = {}

  ###
  ###

  on: (event, callback) ->
    unless @_listeners[event]
      @_listeners[event] = []
    @_listeners[event].push callback

  ###
  ###

  off: (event, callback) ->
    return if not (listeners = @_listeners[event])
    i = listeners.indexOf(callback)
    if ~i
      listeners.splice(i, 1)

  ###
  ###

  once: (event, callback) ->
    @on event, cb = (args...) =>
      @off event, cb
      callback args...

  ###
  ###

  emit: (event) ->
    return unless (listeners = @_listeners[event])
    fnArgs = Array.prototype.slice.call(arguments, 1)

    `for(var i = listeners.length; i--;) { 
      listeners[i].apply(this, fnArgs);
    }`
    
    undefined


module.exports = (fn, ops = {}) ->

  em           = new Emitter()
  called       = false
  memoizedArgs = null

  
  (args...) ->

    cb   = args.pop() or (() ->)

    if memoizedArgs
      return cb memoizedArgs...

    em.once "done", cb
    return if called
    called = true

    args.push (args...) =>
      setTimeout (() =>
        if ops.store isnt false
          memoizedArgs = args
        else
          called = false

        em.emit "done", args...


        if ops.maxAge
          setTimeout (() ->
            memoizedArgs = called = undefined
          ), ops.maxAge
      ), 1


    fn.apply @, args
    @

