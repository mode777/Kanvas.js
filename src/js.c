#include <stdio.h>
#include <assert.h>
#include <stdbool.h>

#define STB_DS_IMPLEMENTATION
#include "stb_ds.h"

#include <SDL.h>
#include <duktape.h>

#include "js.h"

static KVS_Context* kvs;

static inline int get_int(duk_context* vm, const char* key, int def){
    duk_get_prop_string(vm, -1, key);
    int v = duk_get_int_default(vm, -1, def);
    duk_pop(vm);
    return v;
}
static inline const char* get_string(duk_context* vm, const char* key, const char* def){
    duk_get_prop_string(vm, -1, key);
    const char* v = duk_get_string_default(vm, -1, def);
    duk_pop(vm);
    return v;
}
static inline bool get_bool(duk_context* vm, const char* key, bool def){
    duk_get_prop_string(vm, -1, key);
    bool v = duk_get_boolean_default(vm, -1, def);
    duk_pop(vm);
    return v;
}

static void my_fatal(void *udata, const char *msg) {
    (void) udata;  /* ignored in this case, silence warning */

    /* Note that 'msg' may be NULL. */
    fprintf(stderr, "*** FATAL ERROR: %s\n", (msg ? msg : "no message"));
    fflush(stderr);
    abort();
}

bool kvs_push_callback(duk_context* vm, const char* name){
    duk_push_global_object(vm);
    duk_get_prop_string(vm, -1, name);
    if(!duk_is_function(vm, -1)) return false;
    return true;
}

static int mouse_x, mouse_y;

void kvs_on_event(KVS_Context* ctx, SDL_Event* event){
    duk_context* vm = ctx->vm;
    duk_require_stack(vm, 3);
    int w,h;

    if(kvs_push_callback(vm, "dispatchEvent")){
        switch (event->type)
        {
            case SDL_MOUSEMOTION:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "mousemove");
                KVS_NUM_PROP("offsetX", event->motion.x);
                KVS_NUM_PROP("offsetY", event->motion.y);
                KVS_CALLBACK();
                break;
            case SDL_MOUSEBUTTONDOWN:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "mousedown");
                KVS_NUM_PROP("offsetX", event->button.x);
                KVS_NUM_PROP("offsetY", event->button.y);
                KVS_NUM_PROP("button", event->button.button-1);
                KVS_CALLBACK();
                mouse_x = event->button.x;
                mouse_y = event->button.y;
                break;
            case SDL_MOUSEBUTTONUP:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "mouseup");
                KVS_NUM_PROP("offsetX", event->button.x);
                KVS_NUM_PROP("offsetY", event->button.y);
                KVS_NUM_PROP("button", event->button.button-1);
                KVS_CALLBACK();
                if(event->button.x == mouse_x && event->button.y == mouse_y){
                    kvs_push_callback(vm, "dispatchEvent");
                    duk_push_object(vm);
                    KVS_STRING_PROP("type", "click");
                    KVS_NUM_PROP("offsetX", event->button.x);
                    KVS_NUM_PROP("offsetY", event->button.y);
                    KVS_NUM_PROP("button", event->button.button-1);
                    KVS_CALLBACK();
                }
                break;
            case SDL_KEYUP:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "keyup");
                KVS_BOOL_PROP("repeat", event->key.repeat > 0);
                KVS_BOOL_PROP("altKey", (event->key.keysym.mod & KMOD_ALT) > 0);
                KVS_BOOL_PROP("ctrlKey", (event->key.keysym.mod & KMOD_CTRL) > 0);
                KVS_STRING_PROP("key", kvs_get_key(event->key.keysym.sym));
                KVS_CALLBACK();
                break;
            case SDL_KEYDOWN:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "keydown");
                KVS_BOOL_PROP("repeat", event->key.repeat > 0);
                KVS_BOOL_PROP("altKey", (event->key.keysym.mod & KMOD_ALT) > 0);
                KVS_BOOL_PROP("ctrlKey", (event->key.keysym.mod & KMOD_CTRL) > 0);
                KVS_STRING_PROP("key", kvs_get_key(event->key.keysym.sym));
                KVS_CALLBACK();
                break;
            case SDL_WINDOWEVENT:
                switch (event->window.event)
                {
                case SDL_WINDOWEVENT_SIZE_CHANGED:
                    duk_push_global_object(vm);
                    duk_get_prop_string(vm, -1, "kanvas");
                    duk_push_int(vm, event->window.data1);
                    duk_put_prop_string(vm, -2, "width");
                    duk_push_int(vm, event->window.data2);
                    duk_put_prop_string(vm, -2, "height");
                    duk_pop_2(vm);
                    break;
                default:
                    break;
                }
            default:
                break;
        }
    }
}

int kvs_run_file(KVS_Context* ctx, const char* path){
    // set current script-file
    duk_push_global_object(ctx->vm);
    duk_get_prop_string(ctx->vm, -1, "kanvas_config");
    duk_push_string(ctx->vm, path);
    duk_put_prop_string(ctx->vm, -2, "file");
    duk_pop(ctx->vm);

    duk_context* vm = ctx->vm;
    size_t len;
    const char* source = SDL_LoadFile(path, &len);
    if(source == NULL){
        printf("File not found: %s\n", path);
        return -1;
    }
    int result = 0;
    duk_push_string(vm, path);
    if (duk_pcompile_lstring_filename(vm, 0, source, len) != 0) {
        kvs_print_error(ctx, KVS_COMPILE);
        result = -1;
    } else {
        if(duk_pcall(vm, 0) != 0){
            kvs_print_error(ctx, KVS_RUNTIME);
            result = -1;
        }
    }
    duk_pop(vm);
    kvs_run_task_queue(ctx);
    SDL_free((void*)source);
    return result;
}

void kvs_print_error(KVS_Context* ctx, KVS_ErrorType type){
    duk_context* vm = ctx->vm;
    const char* name = get_string(vm, "name", "");
    const char* message = get_string(vm, "message", "");
    printf("%s: %s\n", name, message);
    const char* file = get_string(vm, "fileName", "");
    int line = get_int(vm, "lineNumber", 0);
    int col = get_int(vm, "columnNumber", 0);
    printf("at %s:%d:%d\n", file, line, col);
    const char* stack = get_string(vm, "stack", "");
    printf("%s\n",stack);
}

int kvs_decode_json(KVS_Context* ctx, const char* path){
    duk_context* vm = ctx->vm;
    size_t len;
    const char* source = SDL_LoadFile(path, &len);
    if(source == NULL){
        return -1;
    }
    duk_push_lstring(vm, source, (duk_size_t)len);
    duk_json_decode(vm, -1);
    SDL_free((void*)source);
    return 0;
}

static duk_ret_t js_print(duk_context *ctx) {
    duk_push_string(ctx, " ");
    duk_insert(ctx, 0);
    duk_join(ctx, duk_get_top(ctx) - 1);
    printf("%s\n", duk_to_string(ctx, -1));
    return 0;
}

static duk_ret_t kanvas_set_mode(duk_context *ctx) {
    const char* mode = duk_require_string(ctx,0);
    // if(kvs->mode != KVS_MODE_NONE){
    //     return duk_error(ctx, DUK_ERR_ERROR, "Kanvas context was already created");
    // }
    if(strcmp(mode,"2d") == 0){        
        kvs->mode = KVS_MODE_2D;
    } else if(strcmp(mode,"webgl") == 0){
        kvs->mode = KVS_MODE_WEBGL;
    }
    return 0;
}

void kvs_init(KVS_Context* ctx, const char* configFile) {
    kvs = ctx;
    duk_context* vm = duk_create_heap(NULL, NULL, NULL, NULL, my_fatal);
    assert(vm != NULL);
    ctx->vm = vm;

    KVS_Config cfg = { .width = 640, .height = 480, .title = "Kanvas.js", .retina = true, .resizable = false };
    ctx->config = cfg;
    
    duk_push_global_object(vm);

    if(configFile != NULL && kvs_decode_json(ctx, configFile) == 0){
        ctx->config.width = get_int(vm, "width", ctx->config.width);  
        ctx->config.height = get_int(vm, "height", ctx->config.height);
        ctx->config.title = get_string(vm, "title", ctx->config.title);
        ctx->config.retina = get_bool(vm, "retina", ctx->config.retina);  
        ctx->config.resizable = get_bool(vm, "resizable", ctx->config.resizable);  
        duk_put_prop_string(vm, -2, "kanvas_config");
    } else {
        duk_push_object(vm);
        duk_put_prop_string(vm, -2, "kanvas_config");
    }

    duk_push_c_function(vm, kanvas_set_mode, 1);
    duk_put_prop_string(vm, -2, "kanvas_set_mode");

    int objIndex = duk_push_object(vm);
    duk_push_c_function(vm, js_print, DUK_VARARGS);
    duk_put_prop_string(vm, objIndex, "log");
    duk_push_c_function(vm, js_print, DUK_VARARGS);
    duk_put_prop_string(vm, objIndex, "warn");
    duk_put_prop_string(vm, objIndex-1, "console");

    // TODO: Use kanvas_config instead
    duk_push_int(vm, ctx->config.width);
    duk_put_prop_string(vm, -2, "kanvas_width");
    duk_push_int(vm, ctx->config.height);
    duk_put_prop_string(vm, -2, "kanvas_height");

    duk_pop(vm);

    ctx->window = SDL_CreateWindow(ctx->config.title, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, ctx->config.width, ctx->config.height, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN | (ctx->config.resizable ? SDL_WINDOW_RESIZABLE : 0) | SDL_WINDOW_ALLOW_HIGHDPI);
    assert(ctx->window != NULL);
    ctx->context = SDL_GL_CreateContext(ctx->window);
    assert(ctx->context != NULL);
    SDL_GL_SetSwapInterval(0);

    kvs_nanovg_init(kvs);
    kvs_webgl_init(kvs);
}

void kvs_dispose(KVS_Context* ctx){
    duk_destroy_heap(ctx->vm);
    kvs_nanovg_dispose(ctx->mode);
    ctx->mode = KVS_MODE_NONE;
    SDL_GL_DeleteContext(ctx->context);
    SDL_DestroyWindow(ctx->window);
}

void kvs_run_task_queue(KVS_Context* ctx){
    duk_context* vm = ctx->vm;
    duk_require_stack(vm, 3);
    duk_push_global_object(vm);
    duk_get_prop_string(vm, -1, "Promise");
    duk_get_prop_string(vm, -1, "runQueue");
    duk_pcall(vm, 0);
    duk_pop_3(vm);
}
