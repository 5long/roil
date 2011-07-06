TEST_FILES=${wildcard test/*.js}
TEST_BIN=./node_modules/.bin/reut


test-all:
	$(TEST_BIN) $(TEST_FILES)

update-dep:
	npm update

setup-dev:
	npm link

.PHONY: test-all update-dep setup-dev
