var routes = require("./routes"),
beanpoll   = require("beanpoll");


var router = beanpoll.router();
routes(router);

function _clone(object) {
  return JSON.parse(JSON.stringify(object));
}


var api = module.exports = {
  fetch: function(options, next) {
    if(!/PUT|PATCH|DELETE|POST|GET/.test(String(options.method))) {
      return callback(new Error("method " + options.method + " doesn't exist"));
    }

    router.
    request(options.path).
    tag({ method: options.method }).
    query({ data: options.query, body: options.body }).
    pull(next);
  },
  route: function(options, next) {
    return function(payload, next) {
      api.fetch({
        path   : options.path,
        method : payload.method,
        body   : payload.data,
        query  : {}
      }, function(err, result) {
        if(err) return next(err);
        next(null, result.data.result);
      });
    }
  }
}