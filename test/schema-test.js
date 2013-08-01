var linen = require(".."),
expect    = require("expect.js")

describe("schema", function() {

  it("can be created with fields", function() {

    var schema = linen.schema({
      name: "string"
    });

    expect(schema.field("name")).not.to.be(undefined);
    expect(schema.field("name").options.name).to.be("name");
  });



  it("can be created with the correct types", function() {

    var schema = linen.schema({
      name: "string",
      age: "number",
      custom: "blarg",
      sub: {
        $type: "string"
      }
    });


    expect(schema.field("name").options.type).to.be("string");
    expect(schema.field("age").options.type).to.be("number");
    expect(schema.field("custom").options.type).to.be("blarg");
    expect(schema.field("sub").options.type).to.be("string");
  });

  it("has reference to the parent schema", function() {
    var s = linen.schema({
      name: "string",
      address: {
        city: {
          name: "string"
        }
      }
    });

    expect(s.field("address").parent).to.be(s)
    expect(s.field("address.city").parent).to.be(s.field("address"));
    expect(s.field("address.city.name").parent).to.be(s.field("address.city"));
  })

  it("can specify any option in the schema, and stay separated from sub-schemas", function() {
    var schema = linen.schema({
      name: "string",
      age: {
        $fetch: function() {

        }
      },
      $blarg: 1
    });

    expect(schema.field("name").options.type).to.be("string");
    expect(schema.field("age").options.fetch).not.to.be(undefined);
    expect(schema.field("age").options.type).to.be(undefined);
    expect(schema.field("age.fetch")).to.be(undefined);
    expect(schema.field("blarg")).to.be(undefined);
  });


  it("can be created with sub-fields", function() {
    var schema = linen.schema({
      name: {
        first: "string",
        last: "string"
      }
    });

    expect(schema.field("name")).not.to.be(undefined);
    expect(schema.field("name").options.name).to.be("name");
    expect(schema.field("name").options.type).to.be(undefined);
    expect(schema.field("name.first").options.name).to.be("first");
    expect(schema.field("name.first").options.type).to.be("string");
    expect(schema.field("name.last").options.name).to.be("last");
    expect(schema.field("name.last").options.type).to.be("string");
  });

});