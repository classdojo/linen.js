###
field: {
  $get: () -> @get("property")
  $set: (value) -> @set "property", value
  $bind: ["property", "anotherProperty"]
}
###


class VirtualMapper extends require("./base")

  ###
  ###

  constructor: (field) ->
    super field

    @_get  = field.options.get
    @_set  = field.options.set  or () ->
    @_bind = field.options.bind

  ###
  ###

  prepareModel: (model, data) ->

    ignoreChange = false

    onChange = () =>
      ignoreChange = true
      model.set @field.path, @_get.call model
      ignoreChange = false

    onFieldChange = () =>
      return if ignoreChange or not @_get
      @_set.call model, @field.path, @_get.call model

    for prop in @_bind
      model.bind(prop).to(onChange)

    onChange()
    
    model.bind(@field.path).delay(-1).to(onFieldChange)

  ###
  ###

  @test: (field) -> field.options.get or field.options.set or field.options.bind


module.exports = VirtualMapper