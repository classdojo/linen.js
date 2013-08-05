var Benchmark = require("benchmark"),
suite         = new Benchmark.Suite,
linen = require("..");


var l = linen();

l.schema("person", {
  name: {
    first: "string",
    last: "string"
  },
  address: {
    $ref: "address"
  }
});

l.schema("address", {
  city: "string",
  state: "string",
  zip: "number"
});

suite.add("new person", function() {
  l.model("person");
});


suite.add("existing person", function() {
  l.model("person", { _id: "craig", name: {first:"craig",last:"c"} });
});

suite.add("existing person with address", function() {
  l.model("person", { _id: "craig", name: {first:"craig",last:"c"}, address: "sf" });
});




suite.on("cycle", function(event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});


suite.run({ async: true });