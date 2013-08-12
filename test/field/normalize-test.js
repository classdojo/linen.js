var normalizeDefinition = require("../../lib/field/normalize"),
expect = require("expect.js");

describe("field/normalize#", function() {

  /**
   */

  it("can normalize a simple schema", function() {
    var definition = normalizeDefinition("string");
    expect(definition.type).to.be("string");
  });

  /**
   * options describe capabilities of the given field
   */

   it("separates fields, from options", function() {

    var definition = normalizeDefinition({
      name: "string",
      $type: "object",
      $anotherOption: "blarg"
    });

    expect(definition.type).to.be("object");
    expect(definition.anotherOption).to.be("blarg");
    expect(definition.fields.name.type).to.be("string");
   });

   /**
    */

  it("adds a collection flag to options if it's an array", function() {
    var definition = normalizeDefinition({
      friends: [{
        $ref: "person"
      }]
    });

    expect(definition.fields.friends.collection).to.be(true);
    expect(definition.fields.friends.ref).to.be("person");
  });

  /**
   */

  it("allows types with collections", function() {
    var definition = normalizeDefinition({
      tags: ["string"]
    });

    expect(definition.fields.tags.collection).to.be(true);
    expect(definition.fields.tags.type).to.be("string");
  })

  /**
   */

  it("properly parses deeply nested fields", function() {

    var definition = normalizeDefinition({
      friends: [{
        name: "string",
        address: {
          city: "string",
          state: "string"
        }
      }]
    });

    expect(definition.fields.friends.collection).to.be(true);
    expect(definition.fields.friends.fields.name.type).to.be("string");
    expect(definition.fields.friends.fields.address.fields.city.type).to.be("string");
    expect(definition.fields.friends.fields.address.fields.state.type).to.be("string");
  });
});