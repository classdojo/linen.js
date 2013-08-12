all:
	coffee -o lib -c src	

all-watch: 
	coffee -o lib -cw src

clean:
	rm -rf lib
	rm -rf test-web;

clean-tests: 
	rm -rf test-web;

test-web: clean-tests
	rm -rf test-web;
	cp -r test test-web;
	for F in `find ./test-web -name "*test.js"`; do echo $$F; ./node_modules/.bin/browserify "$$F" -o `echo "$$F" | sed 's/js/min.js/g'` -p browser; rm $$F; done






