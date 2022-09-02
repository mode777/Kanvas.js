#ifndef INK_JS_H
#define INK_JS_H
#include <stdbool.h>

#include <duktape.h>
#include <SDL.h>

#define KVS_STRING_PROP(K,V) duk_push_string(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_STRING_INDEX(K,V) duk_push_string(vm,V);duk_put_prop_index(vm,-2,K)
#define KVS_NUM_PROP(K,V) duk_push_number(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_BOOL_PROP(K,V) duk_push_boolean(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_CALLBACK() if (duk_pcall(vm, 1) != 0){ kvs_print_error(ctx, KVS_RUNTIME); }

typedef struct {
    int width;
    int height;
    const char* title;
    bool retina;
    bool resizable;
} KVS_Config;

typedef struct {
    SDL_Window* window;
    SDL_GLContext* context;
    duk_context* vm;
    KVS_Config config;
} KVS_Context;

typedef enum{
    KVS_COMPILE = 1,
    KVS_RUNTIME = 2
} KVS_ErrorType;

void kvs_init(KVS_Context* ctx, const char* configFile);
void kvs_dispose(KVS_Context* ctx);

int kvs_run_file(KVS_Context* ctx, const char* path);
int kvs_decode_json(KVS_Context* ctx, const char* path);

void kvs_init_vg(KVS_Context* ctx);
void kvs_nanovg_dispose();
void kvs_on_render(KVS_Context* ctx);

void kvs_on_event(KVS_Context* ctx, SDL_Event* ev);
void kvs_run_task_queue(KVS_Context* ctx);
bool kvs_push_callback(duk_context* vm, const char* name);

void kvs_print_error(KVS_Context* ctx, KVS_ErrorType type);

void kvs_init_keys();
const char* kvs_get_key(SDL_Keycode sym);

void kvs_init_fs(KVS_Context* ctx);

#endif