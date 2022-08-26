#ifndef INK_JS_NANOVG_H
#define INK_JS_NANOVG_H

#include <duktape.h>

void ink_js_nanovg_init(duk_context* vm);
void ink_js_nanovg_update(duk_context* vm);

#endif