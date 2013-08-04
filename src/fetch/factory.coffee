FnFetch  = require "./fn"
RefFetch = require "./reference"
NoFetch  = require "./none"

module.exports = (field) ->

  if field.options.fetch
    return new FnFetch field

  return new NoFetch()