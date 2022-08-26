# Kanvas.js

A tiny Javascript interpreter with a canvas (2d) implementation

## Building

Kanvas uses CMake for building.

### Dependencies

* SDL2
* ANGLE (On Desktop platforms)

Static dependencies (create on bulld)
* duktape
* nanovg

### Windows

Building on Windows has only been tested with Mingw32

```
git submodule init
git submodule update --recursive
mkdir build
cd build
cmake ..
cmake --build .
```