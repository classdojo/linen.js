type = require "type-component"

# normalizes the definition options passed on. We want
# it to be flexible, but we want the transformation of that flexibility encapsulated
# in this bit.

module.exports = normalize = (options) -> 
  
  # this happens when the field option is a string - which denotes
  # its type is a string
  if (t = type(options)) is "string"
    return {
      type: options
    }

  # is it an array? field type is a collection
  else if t is "array"
    options = options[0]
    options.$collection = true

  normalizedOptions = {
    fields: {}
  }

  for optionName of options

    value = options[optionName]

    # is it an option?
    if optionName.substr(0, 1) is "$"

      # remove the dollar sign
      normalizedOptions[optionName.substr(1)] = value

    else
      normalizedOptions.fields[optionName] = normalize value


  normalizedOptions

  