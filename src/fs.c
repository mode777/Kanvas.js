#include <stdio.h>
#include <stdlib.h>

#include <SDL.h>
#include <duktape.h>

#include "js.h"



duk_ret_t js_fs_close(duk_context *ctx){
    duk_require_object(ctx, 0);
    duk_get_prop_string(ctx, 0, "_ptr");
    FILE* f = (FILE *)duk_get_pointer_default(ctx, -1, NULL);
    if(f != NULL){
        fclose(f);
        duk_push_pointer(ctx, NULL);
        duk_put_prop_string(ctx, 0, "_ptr");
    }
}

duk_ret_t js_fs_readFile(duk_context* ctx){
    const char* path = duk_require_string(ctx, 0);
    size_t size;
    unsigned char* f = SDL_LoadFile(path, &size);
    if(f == NULL) return -1;
    
    duk_push_fixed_buffer(ctx, size);

    const char* ptr = duk_get_buffer_data(ctx, -1, &size);
    memcpy((void*)ptr, (void*)f, size);
    SDL_free((void*)f);

    duk_push_buffer_object(ctx,-1,0,size,DUK_BUFOBJ_ARRAYBUFFER);

    return 1;
}

duk_ret_t js_fs_readText(duk_context* ctx){
    const char* path = duk_require_string(ctx, 0);
    size_t size;
    unsigned char* f = SDL_LoadFile(path, &size);
    if(f == NULL) return -1;
    
    duk_push_lstring(ctx, f, size);
    SDL_free((void*)f);

    return 1;
}


duk_ret_t js_fs_open(duk_context *ctx)
{
    // Get arguments
    const char* path = duk_require_string(ctx, 0);
    const char* flags = duk_get_string_default(ctx, 1, "rb");

    FILE* f = fopen(path, flags);

    duk_push_object(ctx);
    duk_push_pointer(ctx, (void*)f);
    duk_put_prop_string(ctx, -2, "_ptr");

    // Store the function destructor
    duk_push_c_function(ctx, js_fs_close, 2);
    duk_set_finalizer(ctx, -2);

    return 1;
}


void kvs_init_fs(KVS_Context* ctx) {
    duk_context* vm = ctx->vm;
    duk_push_global_object(vm);
    duk_push_object(vm);

        duk_push_c_function(vm, js_fs_open, 2);
        duk_put_prop_string(vm, -2, "open");

        duk_push_c_function(vm, js_fs_close, 2);
        duk_put_prop_string(vm, -2, "close");

        duk_push_c_function(vm, js_fs_readFile, 1);
        duk_put_prop_string(vm, -2, "readFile");

        duk_push_c_function(vm, js_fs_readText, 1);
        duk_put_prop_string(vm, -2, "readText");

    duk_put_prop_string(vm, -2, "fs");
    duk_pop(vm);
}