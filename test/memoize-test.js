memoize = require("../lib/memoize")
expect  = require("expect.js");

describe("memoize", function() {

	it("can memoize a function", function(next) {
		var count = 0;
		var fn = memoize(function(next) {
			count++;
			next();
		});

		fn(); setTimeout(fn, 5); setTimeout(fn, 10);

		setTimeout(function() {
			expect(count).to.be(1);
			next();
		}, 20)
	});


	it("can memoize a function with a max age", function(next) {
		var count = 0;


		var fn = memoize(function(next) {
			count++;
			next();
		}, {
			maxAge: 10
		});


		fn();

		setTimeout(fn, 20);

		setTimeout(function() {
			expect(count).to.be(2);
			next();
		}, 30);
	});


	it("can pass memoized arguments", function() {
		var fn = memoize(function(next) {
			next("hello!");
		});


		fn(function(msg) {	
			expect(msg).to.be("hello!");
		});

		fn(function(msg) {	
			expect(msg).to.be("hello!");
		});
	});
});