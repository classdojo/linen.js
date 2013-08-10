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
    @_bind = (field.options.bind or []).join(", ");

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

    model.bind(@_bind).delay(0).to(onChange).now()
    model.bind(@field.path).delay(0).to(onFieldChange).now()

  ###
  ###

  @test: (field) -> field.options.get or field.options.set or field.options.bind


module.exports = VirtualMapper