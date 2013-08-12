var Benchmark = require("benchmark"),
suite         = new Benchmark.Suite,
linen = require("..");


var l = linen();

function repeatDef(count, def) {
  var ops = {}
  for(var i = count; i--;) {
    ops["a" + i] = def;
  }
  return ops;
}

var schemas = {
}


function addSchemas(count, name, definition) {
  for(var i = 1; i < count; i++) {
    schemas[i + " " + name] = linen.schema(repeatDef(i, definition));
  }
}


addSchemas(5, "strings", "string");
addSchemas(5, "collections", ["string"]);

function addSuite(name, schema) {
  suite.add(name, function() {
    schema.model();
  })
}

for(var name in schemas) {
  addSuite(name, schemas[name]);
}


suite.on("cycle", function(event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});

suite.run({ async: true });