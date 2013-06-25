personSchema = new linen.Schema
  fields:
    name: "string"
    friends: [
      $ref: "person"
      $get: (value) ->
      $set: (value) ->
      $fetch: (options, next) ->
    ]