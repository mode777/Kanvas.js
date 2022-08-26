#include <duktape.h>
#include <nanovg.h>
#include <GLES2/gl2.h>
#define NANOVG_GLES2_IMPLEMENTATION	// Use GLES2 implementation.
#include <nanovg_gl.h>
#include <SDL.h>

#include "js_nanovg.h"

#define JS_ANIMATION_FRAME_CALLBACK 0

static NVGcontext* vg;

static void call_animation_frame(duk_context* vm){
    duk_require_stack(vm, 2);
    duk_push_global_stash(vm);
    duk_get_prop_index(vm, -1, JS_ANIMATION_FRAME_CALLBACK);
    duk_require_function(vm, -1);
    if(duk_pcall(vm, 0) != 0) {
        printf("Error running callback: %s\n", duk_safe_to_string(vm, -1));
    }
}

static duk_ret_t js_animation_frame(duk_context* ctx){
    duk_require_function(ctx, 0);
    duk_push_global_stash(ctx);
    duk_dup(ctx, 0);
    duk_put_prop_index(ctx, -2, JS_ANIMATION_FRAME_CALLBACK);
    duk_pop(ctx);
    return 0;
}

static duk_ret_t js_vg_begin_path(duk_context* ctx){
    nvgBeginPath(vg);
    return 0;
}

static duk_ret_t js_vg_rect(duk_context* ctx){
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float w = duk_require_number(ctx, 2);
    float h = duk_require_number(ctx, 3);
    nvgRect(vg, x,y,w,h);
    return 0;
}

static duk_ret_t js_vg_fill_color(duk_context* ctx){
    unsigned char r = duk_require_int(ctx, 0);
    unsigned char g = duk_require_int(ctx, 1);
    unsigned char b = duk_require_int(ctx, 2);
    unsigned char a = duk_require_int(ctx, 3);
    nvgFillColor(vg, nvgRGBA(r,g,b,a));
    return 0;
}

static duk_ret_t js_vg_fill(duk_context* ctx){
    nvgFill(vg);
    return 0;
}

void ink_js_nanovg_init(duk_context* vm){

    vg = nvgCreateGLES2(NVG_ANTIALIAS | NVG_STENCIL_STROKES);

    duk_push_global_object(vm);
    duk_push_c_function(vm, js_animation_frame, 1);
    duk_put_prop_string(vm, -2, "requestAnimationFrame");

    int objIndex = duk_push_object(vm);
    duk_push_c_function(vm, js_vg_begin_path, 0);
    duk_put_prop_string(vm, objIndex, "beginPath");
    duk_push_c_function(vm, js_vg_rect, 4);
    duk_put_prop_string(vm, objIndex, "rect");
    duk_push_c_function(vm, js_vg_fill_color, 4);
    duk_put_prop_string(vm, objIndex, "fillColor");
    duk_push_c_function(vm, js_vg_fill, 0);
    duk_put_prop_string(vm, objIndex, "fill");
    duk_put_prop_string(vm, objIndex-1, "vg");
}

void ink_js_nanovg_update(duk_context* vm) {
    //SDL_GL_GetDrawableSize()
    nvgBeginFrame(vg, 640, 480, 1);
    call_animation_frame(vm);
    nvgEndFrame(vg);
    //printf("js update\n");
}