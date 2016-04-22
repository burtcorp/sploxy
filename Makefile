.PHONY: test setup create deploy

FUNCTION_NAME ?= sploxy
ROLE_NAME ?= sploxy

test:
	npm test

create: dist/sploxy.zip
	aws lambda create-function \
		--function-name $(FUNCTION_NAME) \
		--runtime "nodejs4.3" \
		--role $(shell awssec aws iam get-role --role-name $(ROLE_NAME) --query Role.Arn --output text) \
		--handler "sploxy.handler" \
		--description "A proxy between various AWS services and Slack" \
		--memory-size "128" \
		--zip-file fileb://$^

deploy: dist/sploxy.zip
	aws lambda update-function-code \
		--function-name $(FUNCTION_NAME) \
		--zip-file fileb://$^

setup:
	npm install

dist:
	mkdir -p dist

dist/sploxy.zip: dist sploxy.js lib/*.js config/config.json node_modules
	zip -r $@ $(filter-out dist, $^)
