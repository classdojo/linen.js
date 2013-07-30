var fs = require("fs");

module.exports = function() {
  var exp = {};

  var args = Array.prototype.slice.call(arguments, 0),
  dir = args.shift();

  fs.readdirSync(dir).forEach(function(file) {
    if(/index|.DS_Store/.test(file)) return;
    var module = require(dir + "/" + file);

    if(typeof module == "function") {
      module = module.apply(null, args);
    }

    exp[file.split(".").shift()] = module;
  });

  return exp;
}