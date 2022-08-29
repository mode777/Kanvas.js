#ifndef INK_JS_H
#define INK_JS_H
#include <stdbool.h>

#include <duktape.h>
#include <SDL.h>

#define KVS_STRING_PROP(K,V) duk_push_string(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_STRING_INDEX(K,V) duk_push_string(vm,V);duk_put_prop_index(vm,-2,K)
#define KVS_NUM_PROP(K,V) duk_push_number(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_BOOL_PROP(K,V) duk_push_boolean(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_CALLBACK(E) if (duk_pcall(vm, 1) != 0){ printf("Error in event handler (%s): %s\n",E, duk_safe_to_string(vm, -1));}

duk_context* kvs_init();
void kvs_runFile(duk_context* vm, const char* path);
void kvs_nanovg_init(duk_context* vm);
void kvs_nanovg_dispose();
void kvs_on_render(duk_context* vm);
void kvs_on_event(duk_context *vm, SDL_Event* ev);
void kvs_on_mouse_button(duk_context *vm, int button, bool down);
bool kvs_push_callback(duk_context* vm, const char* name);

void kvs_init_keys();
const char* kvs_get_key(SDL_Keycode sym);

#endif