.PHONY: jshint

SOURCES=spate.js

all: jshint concat

jshint:
	jshint $(SOURCES)

concat:
	uglifyjs $(SOURCES) -o spate.min.js
