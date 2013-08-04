FnFetch      = require "./fn"
RefFetch     = require "./reference"
InheritFetch = require "./inherit"

module.exports = (field) ->

  if field.options.fetch
    return new FnFetch field

  # nothing to fetch? bubble it back up
  return new InheritFetch field