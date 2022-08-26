#include <stdio.h>
#include <assert.h>

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
