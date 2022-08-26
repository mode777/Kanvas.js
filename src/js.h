#ifndef INK_JS_H
#define INK_JS_H

#include <duktape.h>

duk_context* ink_js_init();
void ink_js_runFile(duk_context* vm, const char* path);

#endif