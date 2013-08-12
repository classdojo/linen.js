type = require "type-component"

# normalizes the field options passed on. We want
# it to be flexible, but we want the transformation of that flexibility encapsulated
# in this bit.

module.exports = normalize = (options) -> 

  normalizedOptions = {
    fields: {}
  }
  
  # is it an array? field type is a collection
  if type(options) is "array"
    options = options[0]
    normalizedOptions.collection = true


  # this happens when the field option is a string - which denotes
  # its a type
  if type(options) is "string"
    normalizedOptions.type = options
    options = {}


  

  # go through all the options, and parse options, from fields
  for optionName of options

    value = options[optionName]

    # is it an option?
    if optionName.substr(0, 1) is "$"

      # remove the dollar sign
      normalizedOptions[optionName.substr(1)] = value

    # is it a field?
    else
      normalizedOptions.fields[optionName] = normalize value


  normalizedOptions

  