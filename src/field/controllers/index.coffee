module.exports = 
  
  Validator   : require("./validator")
  DataMapper  : require("./dataMapper")
  Transporter : require("./transporter")

  initialize: (field, createController) ->
    for field in field.flatten()
      field.controller = createController field
    field