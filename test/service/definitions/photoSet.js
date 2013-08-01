module.exports = function(transport) {
  return {
    $fields: {
      tags: ["string"],
      photos: [{
        src: "string"
      }]
    }
  }
}