#ifndef INK_JS_H
#define INK_JS_H

#include <duktape.h>

duk_context* kvs_init();
void kvs_runFile(duk_context* vm, const char* path);

#endif