TEST_FILES=${wildcard test/*.js}

test-all:
	reut $(TEST_FILES)

update-dep:
	npm update
	npm uninstall reut

setup-dev:
	npm link
	npm install reut -g

.PHONY: test-all update-dep setup-dev
