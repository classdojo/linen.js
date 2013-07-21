module.exports = function(transport) {
  return {
    $fields: {
      name: {
        first : { $required: true, $type: "string" },
        last  : { $required: true, $type: "string" }
      },
      hobbies: [{
        $ref: "hobby"
      }],
      friends: [{
        $ref: "person"
      }],
      profession: {
        $ref: "profession"
      },
      city: {
        $ref: "city"
      },
      age: "number",
      isOld: "boolean",
      hasFriends: {
        $get: function() {
          return this.get("friends.length") > 1;
        }
      }
    }
  };
}
