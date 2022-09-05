#include <string.h>
#include <stdbool.h>

#include <duktape.h>
#include <nanovg.h>
#include <GLES2/gl2.h>
#define NANOVG_GLES2_IMPLEMENTATION // Use GLES2 implementation.
#include <nanovg_gl.h>
#include <SDL.h>

#include "js.h"

static NVGcontext *vg;

static NVGcolor parse_html_color(const char *str, int len)
{

    unsigned char r = 0, g = 0, b = 0, a = 255;
    if (len == 4)
    {
        sscanf(str, "#%01hhx%01hhx%01hhx", &r, &g, &b);
        r = (r << 4) | r;
        g = (g << 4) | g;
        b = (b << 4) | b;
    }
    else if (len == 7)
    {
        sscanf(str, "#%02hhx%02hhx%02hhx", &r, &g, &b);
    }
    else if (len == 9)
    {
        sscanf(str, "#%02hhx%02hhx%02hhx%02hhx", &r, &g, &b, &a);
    }

    return nvgRGBA(r, g, b, a);
}

static duk_ret_t js_vg_beginPath(duk_context *ctx)
{
    nvgBeginPath(vg);
    return 0;
}

static duk_ret_t js_vg_rect(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float w = duk_require_number(ctx, 2);
    float h = duk_require_number(ctx, 3);
    nvgRect(vg, x, y, w, h);
    return 0;
}

static duk_ret_t js_vg_fillColor(duk_context *ctx)
{
    NVGcolor color;
    if (duk_is_string(ctx, 0))
    {
        size_t len;
        const char *str = duk_require_lstring(ctx, 0, &len);
        color = parse_html_color(str, len);
    }
    else
    {
        unsigned char r = duk_require_int(ctx, 0);
        unsigned char g = duk_require_int(ctx, 1);
        unsigned char b = duk_require_int(ctx, 2);
        unsigned char a = duk_require_int(ctx, 3);
        color = nvgRGBA(r, g, b, a);
    }
    nvgFillColor(vg, color);
    return 0;
}

static duk_ret_t js_vg_fill(duk_context *ctx)
{
    nvgFill(vg);
    return 0;
}

static duk_ret_t js_vg_closePath(duk_context *ctx)
{
    nvgClosePath(vg);
    return 0;
}

static duk_ret_t js_vg_moveTo(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    nvgMoveTo(vg, x, y);
    return 0;
}

static duk_ret_t js_vg_lineTo(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    nvgLineTo(vg, x, y);
    return 0;
}

static duk_ret_t js_vg_lineCap(duk_context *ctx)
{
    duk_int_t cap = duk_require_int(ctx, 0);

    nvgLineCap(vg, cap);
    return 0;
}

static duk_ret_t js_vg_lineJoin(duk_context *ctx)
{
    duk_int_t join = duk_require_int(ctx, 0);

    nvgLineJoin(vg, join);
    return 0;
}

static duk_ret_t js_vg_translate(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);

    nvgTranslate(vg, x, y);
    return 0;
}

static duk_ret_t js_vg_scale(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);

    nvgScale(vg, x, y);
    return 0;
}

static duk_ret_t js_vg_rotate(duk_context *ctx)
{
    float r = duk_require_number(ctx, 0);

    nvgRotate(vg, r);
    return 0;
}

static duk_ret_t js_vg_transform(duk_context *ctx)
{
    float a = duk_require_number(ctx, 0);
    float b = duk_require_number(ctx, 0);
    float c = duk_require_number(ctx, 0);
    float d = duk_require_number(ctx, 0);
    float e = duk_require_number(ctx, 0);
    float f = duk_require_number(ctx, 0);

    nvgTransform(vg,a,b,c,d,e,f);
    return 0;
}

static duk_ret_t js_vg_arc(duk_context *ctx)
{
    float cx = duk_require_number(ctx, 0);
    float cy = duk_require_number(ctx, 1);
    float radius = duk_require_number(ctx, 2);
    float sAngle = duk_require_number(ctx, 3);
    float eAngle = duk_require_number(ctx, 4);
    duk_uint_t flag = duk_require_number(ctx, 5);

    nvgArc(vg, cx, cy, radius, sAngle, eAngle, flag);
    return 0;
}

static duk_ret_t js_vg_stroke(duk_context *ctx)
{
    (void)ctx;
    nvgStroke(vg);
    return 0;
}

static duk_ret_t js_vg_strokeColor(duk_context *ctx)
{
    NVGcolor color;
    if (duk_is_string(ctx, 0))
    {
        size_t len;
        const char *str = duk_require_lstring(ctx, 0, &len);
        color = parse_html_color(str, len);
    }
    else
    {
        unsigned char r = duk_require_int(ctx, 0);
        unsigned char g = duk_require_int(ctx, 1);
        unsigned char b = duk_require_int(ctx, 2);
        unsigned char a = duk_require_int(ctx, 3);
        color = nvgRGBA(r, g, b, a);
    }
    nvgStrokeColor(vg, color);
    return 0;
}

static duk_ret_t js_vg_strokeWidth(duk_context *ctx)
{
    float w = duk_require_number(ctx, 0);

    nvgStrokeWidth(vg, w);
    return 0;
}

static duk_ret_t js_vg_linearGradient(duk_context *ctx)
{
    float ax = duk_require_number(ctx, 0);
    float ay = duk_require_number(ctx, 1);
    float bx = duk_require_number(ctx, 2);
    float by = duk_require_number(ctx, 3);
    // Assume 0~255
    float r0 = duk_require_number(ctx, 4);
    float g0 = duk_require_number(ctx, 5);
    float b0 = duk_require_number(ctx, 6);
    float a0 = duk_require_number(ctx, 7);
    float r1 = duk_require_number(ctx, 8);
    float g1 = duk_require_number(ctx, 9);
    float b1 = duk_require_number(ctx, 10);
    float a1 = duk_require_number(ctx, 11);

    NVGpaint paint = nvgLinearGradient(vg, ax, ay, bx, by, nvgRGBA((unsigned char)r0, (unsigned char)g0, (unsigned char)b0, (unsigned char)a0), nvgRGBA((unsigned char)r1, (unsigned char)g1, (unsigned char)b1, (unsigned char)a1));
    nvgFillPaint(vg, paint);
    // nvgFill(vg);

    return 0;
}

static duk_ret_t js_vg_boxGradient(duk_context *ctx)
{
    float ax = duk_require_number(ctx, 0);
    float ay = duk_require_number(ctx, 1);
    float bx = duk_require_number(ctx, 2);
    float by = duk_require_number(ctx, 3);
    float radius = duk_require_number(ctx, 4);
    float f = duk_require_number(ctx, 5);
    // Assume 0~255
    float r0 = duk_require_number(ctx, 6);
    float g0 = duk_require_number(ctx, 7);
    float b0 = duk_require_number(ctx, 8);
    float a0 = duk_require_number(ctx, 9);
    float r1 = duk_require_number(ctx, 10);
    float g1 = duk_require_number(ctx, 11);
    float b1 = duk_require_number(ctx, 12);
    float a1 = duk_require_number(ctx, 13);

    NVGpaint paint = nvgBoxGradient(vg, ax, ay, bx, by, radius, f, nvgRGBA((unsigned char)r0, (unsigned char)g0, (unsigned char)b0, (unsigned char)a0), nvgRGBA((unsigned char)r1, (unsigned char)g1, (unsigned char)b1, (unsigned char)a1));
    nvgFillPaint(vg, paint);

    return 0;
}

static duk_ret_t js_vg_radialGradient(duk_context *ctx)
{
    float ax = duk_require_number(ctx, 0);
    float ay = duk_require_number(ctx, 1);
    float bx = duk_require_number(ctx, 2);
    float by = duk_require_number(ctx, 3);
    // Assume 0~255
    float r0 = duk_require_number(ctx, 4);
    float g0 = duk_require_number(ctx, 5);
    float b0 = duk_require_number(ctx, 6);
    float a0 = duk_require_number(ctx, 7);
    float r1 = duk_require_number(ctx, 8);
    float g1 = duk_require_number(ctx, 9);
    float b1 = duk_require_number(ctx, 10);
    float a1 = duk_require_number(ctx, 11);

    NVGpaint paint = nvgRadialGradient(vg, ax, ay, bx, by, nvgRGBA((unsigned char)r0, (unsigned char)g0, (unsigned char)b0, (unsigned char)a0), nvgRGBA((unsigned char)r1, (unsigned char)g1, (unsigned char)b1, (unsigned char)a1));
    nvgFillPaint(vg, paint);
    // nvgFill(vg);

    return 0;
}

static duk_ret_t js_vg_scissor(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float w = duk_require_number(ctx, 2);
    float h = duk_require_number(ctx, 3);
    nvgScissor(vg, x, y, w, h);
    return 0;
}

static duk_ret_t js_vg_roundedRect(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float w = duk_require_number(ctx, 2);
    float h = duk_require_number(ctx, 3);
    float r = duk_require_number(ctx, 4);
    nvgRoundedRect(vg, x, y, w, h, r);
    return 0;
}

static duk_ret_t js_vg_circle(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float r = duk_require_number(ctx, 2);
    nvgCircle(vg, x, y, r);
    return 0;
}

static duk_ret_t js_vg_ellipse(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float ra = duk_require_number(ctx, 2);
    float rb = duk_require_number(ctx, 3);
    nvgEllipse(vg, x, y, ra, rb);
    return 0;
}

static duk_ret_t js_vg_bezierTo(duk_context *ctx)
{
    float x0 = duk_require_number(ctx, 0);
    float y0 = duk_require_number(ctx, 1);
    float x1 = duk_require_number(ctx, 2);
    float y1 = duk_require_number(ctx, 3);
    float x2 = duk_require_number(ctx, 4);
    float y2 = duk_require_number(ctx, 5);
    nvgBezierTo(vg, x0, y0, x1, y1, x2, y2);
    return 0;
}

static duk_ret_t js_vg_quadTo(duk_context *ctx)
{
    float x0 = duk_require_number(ctx, 0);
    float y0 = duk_require_number(ctx, 1);
    float x1 = duk_require_number(ctx, 2);
    float y1 = duk_require_number(ctx, 3);
    nvgQuadTo(vg, x0,y0,x1,y1);
    return 0;
}

static duk_ret_t js_vg_fontSize(duk_context *ctx)
{
    float sz = duk_require_number(ctx, 0);
    nvgFontSize(vg, sz);

    return 0;
}

static duk_ret_t js_vg_fontFace(duk_context *ctx)
{
    const char *face = duk_to_string(ctx, 0);
    nvgFontFace(vg, face);

    return 0;
}

static duk_ret_t js_vg_fontBlur(duk_context *ctx)
{
    float blur = duk_require_number(ctx, 0);
    nvgFontBlur(vg, blur);

    return 0;
}

static duk_ret_t js_vg_textAlign(duk_context *ctx)
{
    duk_uint_t flag = duk_require_uint(ctx, 0);
    nvgTextAlign(vg, flag);

    return 0;
}

static duk_ret_t js_vg_text(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    const char *text = duk_safe_to_string(ctx, 2);

    nvgText(vg, x, y, text, NULL);

    return 0;
}

static duk_ret_t js_vg_textBox(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float w = duk_require_number(ctx, 2);
    const char *text = duk_safe_to_string(ctx, 3);

    nvgTextBox(vg,x,y,w,text,NULL);

    return 0;
}

static duk_ret_t js_vg_textBounds(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    const char *text = duk_safe_to_string(ctx, 2);

    float tw = nvgTextBounds(vg, x, y, text, NULL, NULL);

    duk_push_number(ctx, (double)tw);

    return 1;
}

static duk_ret_t js_vg_textMetrics(duk_context *ctx)
{
    float ascender;
    float descender;
    float lineh;
    nvgTextMetrics(vg, &ascender, &descender, &lineh);

    duk_idx_t obj_idx = duk_push_object(ctx);
    duk_push_number(ctx, ascender);
    duk_put_prop_string(ctx, obj_idx, "ascender");
    duk_push_number(ctx, descender);
    duk_put_prop_string(ctx, obj_idx, "descender");
    duk_push_number(ctx, lineh);
    duk_put_prop_string(ctx, obj_idx, "lineh");

    return 1;
}

static duk_ret_t js_vg_clear(duk_context *ctx){
    glClear(GL_COLOR_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    return 1;
}

static duk_ret_t js_vg_createImage(duk_context *ctx)
{
    int id;
    if(duk_is_string(ctx,0)){
        const char *filename = duk_safe_to_string(ctx, 0);
        duk_uint_t flag = duk_require_uint(ctx, 1);

        id = nvgCreateImage(vg, filename, flag);
    } else {
        size_t len;
        unsigned char* mem = duk_require_buffer_data(ctx, 0, &len);
        
        duk_uint_t flag = duk_require_uint(ctx, 1);

        id = nvgCreateImageMem(vg, flag, mem, len);
    }

    duk_push_uint(ctx, id);

    return 1;
}

static duk_ret_t js_vg_imageSize(duk_context *ctx)
{
    duk_uint_t id = duk_require_uint(ctx, 0);

    int w, h;
    nvgImageSize(vg, id, &w, &h);

    duk_idx_t obj_idx = duk_push_object(ctx);
    duk_push_uint(ctx, w);
    duk_put_prop_string(ctx, obj_idx, "width");
    duk_push_uint(ctx, h);
    duk_put_prop_string(ctx, obj_idx, "height");

    return 1;
}

static duk_ret_t js_vg_deleteImage(duk_context *ctx)
{
    duk_uint_t id = duk_require_uint(ctx, 0);

    nvgDeleteImage(vg, id);

    return 0;
}

static duk_ret_t js_vg_imagePattern(duk_context *ctx)
{
    float ox = duk_require_number(ctx, 0);
    float oy = duk_require_number(ctx, 1);
    float ex = duk_require_number(ctx, 2);
    float ey = duk_require_number(ctx, 3);
    float angle = duk_require_number(ctx, 4);
    duk_int_t imgId = duk_require_int(ctx, 5);
    float alpha = duk_require_number(ctx, 6);

    NVGpaint paint = nvgImagePattern(vg, ox, oy, ex, ey, angle, imgId, alpha);
    nvgFillPaint(vg, paint);

    return 0;
}

static duk_ret_t js_vg_save(duk_context *ctx)
{
    (void)ctx;
    nvgSave(vg);
    return 0;
}

static duk_ret_t js_vg_restore(duk_context *ctx)
{
    (void)ctx;
    nvgRestore(vg);
    return 0;
}

static duk_ret_t js_vg_pathWinding(duk_context *ctx)
{
    duk_uint_t flag = duk_require_uint(ctx, 0);
    nvgPathWinding(vg, flag);
    return 0;
}

static duk_ret_t js_vg_intersectScissor(duk_context *ctx)
{
    float x = duk_require_number(ctx, 0);
    float y = duk_require_number(ctx, 1);
    float w = duk_require_number(ctx, 2);
    float h = duk_require_number(ctx, 3);

    nvgIntersectScissor(vg, x, y, w, h);

    return 0;
}

static duk_ret_t js_vg_resetScissor(duk_context *ctx)
{
    (void)ctx;
    nvgResetScissor(vg);

    return 0;
}

static duk_ret_t js_vg_resetTransform(duk_context* ctx){
    (void) ctx;
    nvgResetTransform(vg);
    return 0;
}

static duk_ret_t js_vg_createFont(duk_context *ctx)
{
    const char* name = duk_require_string(ctx,0);
    const char* path = duk_require_string(ctx,1);

    if(nvgCreateFont(vg, name, path) == -1){
        return DUK_ERR_URI_ERROR;
    }

    return 0;
}

typedef enum {
  noCommand,
  beginPath,
  arc,
  arcTo,
  bezierCurveTo,
  closePath,
  ellipse,
  lineTo,
  moveTo,
  quadraticCurveTo,
  rect
} CommandOp;

static duk_ret_t js_vg_applyPath(duk_context *ctx)
{
    size_t len;
    unsigned int* commands = duk_require_buffer_data(ctx,0,&len);
    float* coordinates = (float*)commands;
    len /= sizeof(float);
    size_t i = 0;
    while(i < len)
    {
        switch (commands[i])
        {
            case noCommand:
                goto BREAK;
            case beginPath:
                nvgBeginPath(vg);
                //nvgPathWinding(vg, NVG_HOLE);
                i++;
                break;
            case arc:
                nvgArc(vg, 
                    coordinates[i+1], 
                    coordinates[i+2], 
                    coordinates[i+3], 
                    coordinates[i+4], 
                    coordinates[i+5], 
                    coordinates[i+6]);
                i+=7;
                break;
            case arcTo:
                nvgArcTo(vg, 
                    coordinates[i+1], 
                    coordinates[i+2], 
                    coordinates[i+3], 
                    coordinates[i+4], 
                    coordinates[i+5]);
                i+=6;
                break;
            case bezierCurveTo:
                nvgBezierTo(vg, 
                    coordinates[i+1], 
                    coordinates[i+2], 
                    coordinates[i+3], 
                    coordinates[i+4], 
                    coordinates[i+5],
                    coordinates[i+6]);
                i+=7;
                break;
            case closePath:
                nvgClosePath(vg);
                nvgPathWinding(vg, NVG_HOLE);
                i++;
                break;
            case ellipse:
                // TODO: Fix ellipse implementation
                nvgEllipse(vg, 
                    coordinates[i+1], 
                    coordinates[i+2], 
                    coordinates[i+3], 
                    coordinates[i+4]);
                i+=9;
                break;
            case lineTo:
                nvgLineTo(vg, 
                    coordinates[i+1], 
                    coordinates[i+2]);
                i+=3;
                break;
            case moveTo:
                nvgMoveTo(vg, 
                    coordinates[i+1], 
                    coordinates[i+2]);
                i+=3;
                break;
            case quadraticCurveTo:
                nvgQuadTo(vg, 
                    coordinates[i+1], 
                    coordinates[i+2],
                    coordinates[i+3],
                    coordinates[i+4]);
                i+=5;
                break;
            case rect:
                nvgRect(vg, 
                    coordinates[i+1], 
                    coordinates[i+2],
                    coordinates[i+3],
                    coordinates[i+4]);
                i+=5;
                break;
            default:
                printf("Illegal opcode for path, path data corrupted?\n");
                abort();
                break;
        }
    }
BREAK: 
    
    return 0;
}


 static const duk_function_list_entry my_module_funcs[] = {
      { "beginPath", js_vg_beginPath, 0 /* no args */ },
      { "closePath", js_vg_closePath, 0 },
      { "moveTo", js_vg_moveTo, 2 },
      { "lineTo", js_vg_lineTo, 2 },
      { "lineCap", js_vg_lineCap, 1 },
      { "lineJoin", js_vg_lineJoin, 1 },
      { "translate", js_vg_translate, 2 },
      { "scale", js_vg_scale, 2 },
      { "rotate", js_vg_rotate, 1 },
      { "transform", js_vg_transform, 6 },
      { "fillColor", js_vg_fillColor, 4 },
      { "fill", js_vg_fill, 0 },
      { "scissor", js_vg_scissor, 4 },
      { "rect", js_vg_rect, 4 },
      { "arc", js_vg_arc, 6 },
      { "circle", js_vg_circle, 3 },
      { "ellipse", js_vg_ellipse, 4 },
      { "bezierTo", js_vg_bezierTo, 6 },
      { "quadTo", js_vg_quadTo, 4 },
      { "roundedRect", js_vg_roundedRect, 5 },
      { "linearGradient", js_vg_linearGradient, 12 },
      { "radialGradient", js_vg_radialGradient, 12 },
      { "stroke", js_vg_stroke, 0 },
      { "strokeWidth", js_vg_strokeWidth, 1 },
      { "strokeColor", js_vg_strokeColor, 4 },
      { "save", js_vg_save, 0 },
      { "restore", js_vg_restore, 0 },
      { "text", js_vg_text, 3 },
      { "textBox", js_vg_textBox, 4 },
      { "pathWinding", js_vg_pathWinding, 1 },
      { "boxGradient", js_vg_boxGradient,14 },
      { "createFont", js_vg_createFont, 2 },
      { "fontSize", js_vg_fontSize, 1 },
      { "fontFace", js_vg_fontFace, 1 },
      { "fontBlur", js_vg_fontBlur, 1 },
      { "textAlign", js_vg_textAlign, 1 },
      { "textBounds", js_vg_textBounds, 3 },
      { "textMetrics", js_vg_textMetrics, 1 },
      { "createImage", js_vg_createImage, 2 },
      { "imageSize", js_vg_imageSize, 1 },
      { "deleteImage", js_vg_deleteImage, 1 },
      { "imagePattern", js_vg_imagePattern, 7 },
      { "intersectScissor", js_vg_intersectScissor, 4 },
      { "resetScissor", js_vg_resetScissor, 0 },
      { "resetTransform", js_vg_resetTransform, 0 },
      { "clear", js_vg_clear, 0 },
      { "applyPath", js_vg_applyPath, 1 },
      { NULL, NULL, 0 }
  };

void kvs_init_vg(KVS_Context* ctx)
{
    duk_context *vm = ctx->vm;
    vg = nvgCreateGLES2(NVG_ANTIALIAS | NVG_STENCIL_STROKES);

    duk_push_global_object(vm);
 
    int objIndex = duk_push_object(vm);
    duk_put_function_list(vm, -1, my_module_funcs);
 
    duk_push_uint(vm, NVG_CCW);
    duk_put_prop_string(vm, -2, "CCW");
    duk_push_uint(vm, NVG_CW);
    duk_put_prop_string(vm, -2, "CW");

    duk_push_uint(vm, NVG_SOLID);
    duk_put_prop_string(vm, -2, "SOLID");
    duk_push_uint(vm, NVG_HOLE);
    duk_put_prop_string(vm, -2, "HOLE");

    duk_push_uint(vm, NVG_BUTT);
    duk_put_prop_string(vm, -2, "BUTT");
    duk_push_uint(vm, NVG_ROUND);
    duk_put_prop_string(vm, -2, "ROUND");
    duk_push_uint(vm, NVG_SQUARE);
    duk_put_prop_string(vm, -2, "SQUARE");
    duk_push_uint(vm, NVG_BEVEL);
    duk_put_prop_string(vm, -2, "BEVEL");
    duk_push_uint(vm, NVG_MITER);
    duk_put_prop_string(vm, -2, "MITER");

    duk_push_uint(vm, NVG_ALIGN_LEFT);
    duk_put_prop_string(vm, -2, "ALIGN_LEFT");
    duk_push_uint(vm, NVG_ALIGN_CENTER);
    duk_put_prop_string(vm, -2, "ALIGN_CENTER");
    duk_push_uint(vm, NVG_ALIGN_RIGHT);
    duk_put_prop_string(vm, -2, "ALIGN_RIGHT");
    duk_push_uint(vm, NVG_ALIGN_TOP);
    duk_put_prop_string(vm, -2, "ALIGN_TOP");
    duk_push_uint(vm, NVG_ALIGN_MIDDLE);
    duk_put_prop_string(vm, -2, "ALIGN_MIDDLE");
    duk_push_uint(vm, NVG_ALIGN_BOTTOM);
    duk_put_prop_string(vm, -2, "ALIGN_BOTTOM");
    duk_push_uint(vm, NVG_ALIGN_BASELINE);
    duk_put_prop_string(vm, -2, "ALIGN_BASELINE");

    duk_put_prop_string(vm, objIndex - 1, "vg");
}

void kvs_on_render(KVS_Context* ctx)
{
    duk_context *vm = ctx->vm;

    // glClearColor(0.3f,0,0,1);


    // SDL_GL_GetDrawableSize()

    duk_require_stack(vm, 2);
    if(kvs_push_callback(vm, "onrender")){
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        glEnable(GL_CULL_FACE);
        glDisable(GL_DEPTH_TEST);

        double time = ((double)SDL_GetTicks());
        duk_push_number(vm, time);
        int ww,wh,rw,rh;
        SDL_GL_GetDrawableSize(ctx->window, &rw, &rh);
        SDL_GetWindowSize(ctx->window, &ww,&wh);
        glViewport(0,0,rw,rh);
        nvgBeginFrame(vg, ctx->config.width, ctx->config.height, ctx->config.retina ? rw/ww : 1);
        
        if (duk_pcall(vm, 1) != 0)
        {
            kvs_print_error(ctx, KVS_RUNTIME);
        }
        nvgEndFrame(vg);
        
        SDL_Window* win = SDL_GL_GetCurrentWindow();
        SDL_GL_SwapWindow(win);
    }
}

void kvs_nanovg_dispose()
{
    nvgDeleteGLES2(vg);
}