var routes = require("./routes"),
beanpoll   = require("beanpoll");


var router = beanpoll.router();
routes(router);

function _clone(object) {
  return JSON.parse(JSON.stringify(object));
}


module.exports = {
  fetch: function() {

  }
}