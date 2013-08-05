dref = require "dref"

class RefJSONifier extends require("./base")

  ###
  ###

  writeJSON: (model, data) ->   
    ref = model.get(@field.path)
    dref.set data, @field.path, ref?.toJSON()

module.exports = RefJSONifier