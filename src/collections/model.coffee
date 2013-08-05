
class ModelCollection extends require("./base")
  
  ###
  ###

  __collectionType: "model"

  ###
  ###

  constructor: (field) ->
    super field


    @transform().
    map((value) =>

      if value.__isModel 
        return value

      m = field.linen.model(field.options.ref, value)
      m.owner = @owner
      m
    )


  ###
  ###

  clear: () ->
    source = @source().concat()
    for model in source
      model.remove()

  ###
  ###

  reset: (source) ->
    super source

  ###
  ###

  load: (next) ->


  ###
  ###

  save: (next) ->




module.exports = ModelCollection