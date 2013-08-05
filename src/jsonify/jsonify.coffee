dref = require "dref"

class JSONify extends require("./base")
  
  ###
  ###

  writeJSON: (model, data) -> 
    dref.set data, @field.path, model.get(@field.property)
    

module.exports = JSONify