.PHONY: jshint

SOURCES=gorealtime.js

all: jshint concat

jshint:
	jshint $(SOURCES)

concat:
	uglifyjs $(SOURCES) -o gorealtime.min.js
