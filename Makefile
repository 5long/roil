TEST_FILES=${wildcard test/*.js}

test-all:
	reut $(TEST_FILES)

.PHONY: test-all
