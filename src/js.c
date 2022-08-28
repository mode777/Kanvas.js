#include <stdio.h>
#include <assert.h>
#include <stdbool.h>

#include <SDL.h>
#include <duktape.h>

#include "js.h"

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

void kvs_on_mouse_move(duk_context *vm, int x, int y)
{
    duk_require_stack(vm, 3);
    if(kvs_push_callback(vm, KVS_MOUSE_MOVE_CALLBACK)){
        duk_push_number(vm, x);
        duk_push_number(vm, y);
        if (duk_pcall(vm, 2) != 0){ printf("Error in event handler (E): %s\n", duk_safe_to_string(vm, -1));}
    }
}

#define KVS_STRING_PROP(K,V) duk_push_string(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_NUM_PROP(K,V) duk_push_number(vm,V);duk_put_prop_string(vm,-2,K)
#define KVS_CALLBACK(E) if (duk_pcall(vm, 1) != 0){ printf("Error in event handler (%s): %s\n",E, duk_safe_to_string(vm, -1));}

static int mouse_x, mouse_y;

void kvs_on_event(duk_context *vm, SDL_Event* event){
    duk_require_stack(vm, 3);
    if(kvs_push_callback(vm, "dispatchEvent")){
        switch (event->type)
        {
            case SDL_MOUSEMOTION:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "mousemove");
                KVS_NUM_PROP("offsetX", event->motion.x);
                KVS_NUM_PROP("offsetY", event->motion.y);
                KVS_CALLBACK("mousemove");
                break;
            case SDL_MOUSEBUTTONDOWN:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "mousedown");
                KVS_NUM_PROP("offsetX", event->button.x);
                KVS_NUM_PROP("offsetY", event->button.y);
                KVS_NUM_PROP("button", event->button.button-1);
                KVS_CALLBACK("mousedown");
                mouse_x = event->button.x;
                mouse_y = event->button.y;
                break;
            case SDL_MOUSEBUTTONUP:
                duk_push_object(vm);
                KVS_STRING_PROP("type", "mouseup");
                KVS_NUM_PROP("offsetX", event->button.x);
                KVS_NUM_PROP("offsetY", event->button.y);
                KVS_NUM_PROP("button", event->button.button-1);
                KVS_CALLBACK("mouseup");
                if(event->button.x == mouse_x && event->button.y == mouse_y){
                    kvs_push_callback(vm, "dispatchEvent");
                    duk_push_object(vm);
                    KVS_STRING_PROP("type", "click");
                    KVS_NUM_PROP("offsetX", event->button.x);
                    KVS_NUM_PROP("offsetY", event->button.y);
                    KVS_NUM_PROP("button", event->button.button-1);
                    KVS_CALLBACK("click");
                }
                break;
            default:
                break;
        }
    }
}

void kvs_runFile(duk_context* vm, const char* path){
    size_t len;
    const char* source = SDL_LoadFile(path, &len);
    assert(source != NULL);
    duk_push_lstring(vm, source, (duk_size_t)len);
    
    if (duk_peval(vm) != 0) {
        printf("Error running: %s\n", duk_safe_to_string(vm, -1));
    }
    duk_pop(vm);
    SDL_free((void*)source);
}

static duk_ret_t js_print(duk_context *ctx) {
    duk_push_string(ctx, " ");
    duk_insert(ctx, 0);
    duk_join(ctx, duk_get_top(ctx) - 1);
    printf("%s\n", duk_to_string(ctx, -1));
    return 0;
}

duk_context* kvs_init() {

    duk_context* vm = duk_create_heap(NULL, NULL, NULL, NULL, my_fatal);
    assert(vm != NULL);

    duk_push_global_object(vm);
    int objIndex = duk_push_object(vm);
    duk_push_c_function(vm, js_print, DUK_VARARGS);
    duk_put_prop_string(vm, objIndex, "log");
    duk_put_prop_string(vm, objIndex-1, "console");
    
    duk_pop(vm);

    return vm;
}
