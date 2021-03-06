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

    field.options.persist = false

    @_get  = field.options.get
    @_set  = field.options.set  or () ->
    @_bind = field.options.bind

  ###
  ###

  prepareModel: (model, data) ->

    ignoreChange = false

    onChange = () =>
      return if ignoreChange
      ignoreChange = true
      model.set @field.path, @_get.call model
      ignoreChange = false

    onFieldChange = (value) =>
      return if ignoreChange or not @_get
      ignoreChange = true
      @_set.call model, value
      ignoreChange = false

    for prop in @_bind
      model.bind(prop).to(onChange)

    model.bind(@field.path).delay(-1).to(onFieldChange).now()
    onChange()


  ###
  ###

  @test: (field) -> field.options.get or field.options.set or field.options.bind


module.exports = VirtualMapper