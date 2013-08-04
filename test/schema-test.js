var linen = require(".."),
expect    = require("expect.js")

describe("schema", function() {

  it("can be created with fields", function() {

    var schema = linen.schema({
      name: "string"
    });

    expect(schema.getField("name")).not.to.be(undefined);
    expect(schema.getField("name").options.name).to.be("name");
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


    expect(schema.getField("name").options.type).to.be("string");
    expect(schema.getField("age").options.type).to.be("number");
    expect(schema.getField("custom").options.type).to.be("blarg");
    expect(schema.getField("sub").options.type).to.be("string");
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

    expect(s.getField("address").parent).to.be(s)
    expect(s.getField("address.city").parent).to.be(s.getField("address"));
    expect(s.getField("address.city.name").parent).to.be(s.getField("address.city"));
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

    expect(schema.getField("name").options.type).to.be("string");
    expect(schema.getField("age").options.fetch).not.to.be(undefined);
    expect(schema.getField("age").options.type).to.be(undefined);
    expect(schema.getField("age.fetch")).to.be(undefined);
    expect(schema.getField("blarg")).to.be(undefined);
  });


  it("can be created with sub-fields", function() {
    var schema = linen.schema({
      name: {
        first: "string",
        last: "string"
      }
    });

    expect(schema.getField("name")).not.to.be(undefined);
    expect(schema.getField("name").options.name).to.be("name");
    expect(schema.getField("name").options.type).to.be(undefined);
    expect(schema.getField("name.first").options.name).to.be("first");
    expect(schema.getField("name.first").options.type).to.be("string");
    expect(schema.getField("name.last").options.name).to.be("last");
    expect(schema.getField("name.last").options.type).to.be("string");
  });

});