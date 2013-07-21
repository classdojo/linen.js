var linen = require("../../")(),
data = require("./data"),
definitions = require("./definitions");


for(var name in definitions) {
  linen.register(name, definitions[name]);
}

module.exports = linen;