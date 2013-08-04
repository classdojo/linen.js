EventEmitter = require("events").EventEmitter

module.exports = (fn, ops = {}) ->

  em           = new EventEmitter()
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
      ), 0


    fn.apply @, args
    @


