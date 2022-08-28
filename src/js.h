#ifndef INK_JS_H
#define INK_JS_H
#include <stdbool.h>

#include <duktape.h>
#include <SDL.h>

#define KVS_ANIMATION_FRAME_CALLBACK "onrender"
#define KVS_MOUSE_MOVE_CALLBACK "onmousemove"
#define KVS_MOUSE_BUTTON_CALLBACK "onmousebutton"
#define KVS_KEY_CALLBACK "onkey"

duk_context* kvs_init();
void kvs_runFile(duk_context* vm, const char* path);
void kvs_nanovg_init(duk_context* vm);
void kvs_nanovg_dispose();
void kvs_on_render(duk_context* vm);
void kvs_on_event(duk_context *vm, SDL_Event* ev);
void kvs_on_mouse_button(duk_context *vm, int button, bool down);
bool kvs_push_callback(duk_context* vm, const char* name);

#endif