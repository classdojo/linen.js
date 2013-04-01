var Route = require("../").Route,
expect = require("expect.js");

describe("route", function() {

  return;
  
  var routes = {
    routes: {
      user: {
        path: "/",
        schema: "user",
        routes: {
          "classes": {
            ref: "classes",
            fetch: false
          },
          "tags": {
            schema: "tag"
          }
        }
      },
      tree: {
        schema: "tree",
        route: {
          "tree": {
            ref: "tree"
          }
        }
      },
      classes: {
        schema: "class"
      }
    }
  }


  var route = new Route(routes);

  it("users can be the root path", function() {
    expect(route.route("user").path({ user: "me" })).to.be("/me");
  });

  it("can reference user classes", function() {
    expect(route.route("user.classes").path({ user: "me" })).to.be("/me/classes");
  });

  it("when class is provided, then move to another route", function() {
    expect(route.route("user.classes").path({ user: "me", class: "cooking" })).to.be("/classes/cooking");
  });

  it("can reference a user tag", function() {
    expect(route.route("user.tags").path({ user: "me" })).to.be("/me/tags");
  });

  it("when tag is provided, it still has /me/tags", function() {
    expect(route.route("user.tags").path({ user: "me", tag: "hello" })).to.be("/me/tags/hello");
  });


  it("can route an item", function() {
    expect(route.route("user").routeItem([1])).to.be(1);
  });
});