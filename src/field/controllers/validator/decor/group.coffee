async = require "async"

class GroupValidator extends require("./base")
  
  ###
  ###

  constructor: (field, @validators) ->
    super field

  ###
  ###

  validate: (model, next) ->
    async.forEach @validators, ((validator, next) ->
      validator.validate model, next
    ), next

module.exports = GroupValidator