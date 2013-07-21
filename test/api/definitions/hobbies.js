module.exports = function(transport) {
  return {
    $fields: {
      name: "string",
      description: "string",
      tags: ["string"],
      people: [{
        $ref: "person"
      }],
      meta: "object",
      photoSets: {
        $ref: "photoSets",
        $fetch: function() {

        }
      }
    }
  }
}