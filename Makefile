BIN = ./node_modules/.bin

test-jshint:
	@$(BIN)/grunt jshint
test-jscs:
	@$(BIN)/grunt jscs
test-mocha:
	@NODE_ENV=test $(BIN)/mocha --bail --timeout 60000 --reporter dot
test: test-jshint test-jscs test-mocha clean

test-cov:
	$(MAKE) test-jshint
	$(MAKE) test-jscs
	@NODE_ENV=test $(BIN)/istanbul cover \
	./node_modules/mocha/bin/_mocha -- -t 60000 -R dot

clean:
	@rm -f ./examples/public/css/base-*.css ./examples/public/js-dist/base-*.js ./*.tmp && rm -Rf ./coverage

define release
  VERSION=`node -pe "require('./package.json').version"` && \
  NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
  node -e "\
    var j = require('./package.json');\
    j.version = \"$$NEXT_VERSION\";\
    var s = JSON.stringify(j, null, 2);\
    require('fs').writeFileSync('./package.json', s);" && \
  git commit -m "Bump $$NEXT_VERSION" -- package.json && \
  git tag "$$NEXT_VERSION" -m ""
endef

release-patch:
	@$(call release,patch)

release-minor:
	@$(call release,minor)

release-major:
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

.PHONY: test
