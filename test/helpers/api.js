var routes = require("./routes"),
beanpoll   = require("beanpoll"),
type       = require("type-component");


var router = beanpoll.router();
routes(router);

function _clone(object) {
  return JSON.parse(JSON.stringify(object));
}


var api = module.exports = {
  fetch: function(options, next) {
    if(!/PUT|PATCH|DELETE|POST|GET/.test(String(options.method))) {
      return next(new Error("method " + options.method + " doesn't exist"));
    }

    //console.log("%s %s", options.method, options.path);

    router.
    request(options.path).
    tag({ method: options.method }).
    query({ data: options.query, body: options.body }).
    pull(next);
  },
  route: function(options) {

    if(!options) options = {}

    if(!options.path) {
      options.path = function(payload) {
        if(!payload.model.schema.options.path) return;
        return payload.model.schema.options.path(payload.model);
      }
    }

    return function(payload, next) {

      var pd = payload,
      path = type(options.path) == "function" ? options.path(pd) : options.path;

      if(options.inheritPath) {
        var owner = payload.model.owner;
        while(owner && owner.schema.options.path) {
          path = owner.schema.options.path(owner) + "/" + path;
          owner = owner.owner;
        }
      }



      api.fetch({
        path   : path,
        method : pd.method,
        body   : pd.data,
        query  : {}
      }, function(err, result) {
        if(err) return next(err);
        if(result.data.errors) return next(new Error(result.data.errors.shift().message))
        next(null, result.data.result);
      });
    }
  }
}