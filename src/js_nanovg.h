#ifndef INK_JS_NANOVG_H
#define INK_JS_NANOVG_H

#include <duktape.h>

void kvs_nanovg_init(duk_context* vm);
void kvs_nanovg_dispose();
void kvs_nanovg_update(duk_context* vm);


#endif