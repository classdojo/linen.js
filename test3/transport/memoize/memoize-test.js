var memoize = require("../../../lib/field/controllers/transporter/memoize/fn"),
expect = require("expect.js");

describe("memoize fn#", function() {

  /*it("can memoize a value returned by a function", function(next) {

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
      }, 20);
    })
  });*/


  it("can throw away the memoized values after a result is returned", function(next) {
    var count = 0;
    var fn = memoize(function(next) {
      count++;
      setTimeout(function() {
        next(null, count);
      }, 3);
    }, {
      store: false
    });


    fn(function(err, count) {
      fn(function(err, count) {
        expect(count).to.be(1);
      })
    });


    fn(function(err, count) {
      expect(count).to.be(2);
      next();
    });


  });
});