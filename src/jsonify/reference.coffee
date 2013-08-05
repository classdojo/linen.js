dref = require "dref"

class RefJSONifier extends require("./base")

  ###
  ###

  writeJSON: (model, data) -> 
    dref.set data, @field.path, model.get(@field.path)

module.exports = RefJSONifier