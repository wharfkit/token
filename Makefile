SHELL := /bin/bash
SRC_FILES := $(shell find src -name '*.ts')
TEST_FILES := $(wildcard test/tests/*.ts)
BIN := ./node_modules/.bin
MOCHA_OPTS := -u tdd -r ts-node/register -r tsconfig-paths/register --extension ts

lib: ${SRC_FILES} package.json tsconfig.json node_modules rollup.config.js
	@${BIN}/rollup -c && touch lib

.PHONY: test
test: node_modules
	@TS_NODE_PROJECT='./test/tsconfig.json' MOCK_DIR='./test/data' \
		${BIN}/mocha ${MOCHA_OPTS} test/tests/*.ts --grep '$(grep)'

.PHONY: coverage
coverage: node_modules
	@TS_NODE_PROJECT='./test/tsconfig.json' ${BIN}/nyc --reporter=html \
		${BIN}/mocha -u tdd -r ts-node/register --extension ts test/*.ts \
		-R nyan && open coverage/index.html

.PHONY: check
check: node_modules
	@${BIN}/eslint src --ext .ts --max-warnings 0 --format unix && echo "Ok"

.PHONY: format
format: node_modules
	@${BIN}/eslint src test --ext .ts --fix

.PHONY: ci-test
ci-test: node_modules
	@TS_NODE_PROJECT='./test/tsconfig.json' MOCK_DIR='./test/data' \
		${BIN}/nyc ${NYC_OPTS} --reporter=text \
		${BIN}/mocha ${MOCHA_OPTS} -R list test/tests/*.ts

.PHONY: ci-lint
ci-lint: node_modules
	@${BIN}/eslint src --ext .ts --max-warnings 0 --format unix && echo "Ok"

docs: $(SRC_FILES) node_modules
	@${BIN}/typedoc --out docs \
		--excludeInternal --excludePrivate --excludeProtected \
		--includeVersion --readme none \
		src/index.ts

.PHONY: deploy-pages
deploy-pages: docs
	@${BIN}/gh-pages -d docs

node_modules:
	yarn install --non-interactive --frozen-lockfile --ignore-scripts

.PHONY: clean
clean:
	rm -rf lib/ coverage/ docs/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
