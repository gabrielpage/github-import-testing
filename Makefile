.PHONY: TAGS

TAGS:
	find . -type f -iname \*.js | etags -
