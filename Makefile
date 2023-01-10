GC=go

all:
	$(GC) build -o bin/beam

dev:
	$(GC) run -tags dev main.go