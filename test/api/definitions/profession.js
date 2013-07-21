module.exports = function(transport) {
  return {
    $fields: {
      description: "string",
      people: [{
        $ref: "person"
      }]
    }
  }
}