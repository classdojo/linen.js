var memoize = require("../lib/memoize"),
expect = require("expect.js");

describe("memoizer", function() {

  it("can memoize a value returned by a function", function(next) {

    var count = 0;
    var fn = memoize(function(next) {
      count++;
      next(null, count);
    });

    fn(function() {
      fn(function(err, count) {
        expect(count).to.be(1);
        next();
      })
    })
  });

  it("can memoize a value with a max age", function(next) {

    var count = 0;
    var fn = memoize(function(next) {
      count++;
      next(null, count);
    }, {
      maxAge: 10
    });

    fn(function() {
      setTimeout(function() {
        fn(function(err, count) {
          expect(count).to.be(2);
          next();
        })
      }, 11);
    })
  });
});