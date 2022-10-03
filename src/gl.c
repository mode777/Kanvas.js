#include <string.h>
#include <stdbool.h>

#include <duktape.h>
#include <GLES2/gl2.h>
#define DUKWEBGL_IMPLEMENTATION 
#define GL_VERSION_0_0
#define GL_VERSION_1_0
#define GL_VERSION_1_1
#define GL_VERSION_1_2
#define GL_VERSION_1_3
#define GL_VERSION_1_4
#define GL_VERSION_1_5
#define GL_VERSION_2_0
#define GL_VERSION_3_0
#define GL_VERSION_3_1
#define GL_VERSION_3_2
#define GL_VERSION_3_3
#define GL_VERSION_4_0
#define GL_VERSION_4_2
#include <dukwebgl.h>
#include <SDL.h>

#include "js.h"

void kvs_webgl_init(KVS_Context* ctx){
    dukwebgl_bind(ctx->vm);
}
