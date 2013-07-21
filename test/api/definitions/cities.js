module.exports = function(transport) {
  return {
    $fields: {
      name: "string",
      state: "string",
      loc: ["number"]
    }
  };
}