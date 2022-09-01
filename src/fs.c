#include <stdio.h>
#include <stdlib.h>

#include <duktape.h>

#include "js.h"

duk_ret_t js_fs_close(duk_context *ctx){
    //duk_require_object(
}

duk_ret_t js_fs_open(duk_context *ctx)
{
    // Get arguments
    const char* path = duk_require_string(ctx, 0);
    const char* flags = duk_require_string(ctx, 1);

    FILE* f = fopen(path, flags);

    duk_push_object(ctx);
    duk_push_pointer(ctx, (void*)f);
    duk_put_prop_string(ctx, -2, "_ptr");

    // Store the underlying object
    duk_push_pointer(ctx, f);

    // Store the function destructor
    duk_push_c_function(ctx, js_fs_close, 2);
    duk_set_finalizer(ctx, -2);

    return 0;
}


void kvs_init_fs(KVS_Context* ctx) {
    duk_context* vm = ctx->vm;
    duk_push_global_object(vm);
    duk_push_object(vm);

        duk_push_c_function(vm, js_fs_open, 2);
        duk_push_string(vm, "open");


    duk_put_prop_string(vm, -1, "fs");
    duk_pop(vm);
}