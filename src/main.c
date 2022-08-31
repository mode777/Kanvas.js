#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include <SDL.h>
#include <GLES2/gl2.h>
//#include <EGL/egl.h>
#include <duktape.h>

#include "js.h"

static int _argc;
static char* _argv[16];
static SDL_Event event;
static KVS_Context ctx;
static bool quit;



static void init(){
  kvs_init(&ctx, "kanvas.json");
  kvs_init_keys();
  kvs_nanovg_init(&ctx);

  kvs_run_file(&ctx, "polyfills.js");
  //kvs_run_file(&ctx, "./thirdparty/duktape/polyfills/promise.js");
  if(_argc == 1){
    kvs_run_file(&ctx, "main.js");
  } else {
    for (size_t i = 1; i < _argc; i++)
    {
        kvs_run_file(&ctx, _argv[i]);
    } 
  }
}

static void dispose(){
  kvs_nanovg_dispose();
  kvs_dispose(&ctx);
}

static void reset(){
  dispose();
  init();
}

static void update(){
    while(SDL_PollEvent(&event)){
      switch (event.type)
      {
        case SDL_QUIT:
          quit = true;
          break;
        case SDL_KEYUP:
          if(event.key.keysym.scancode == SDL_SCANCODE_F5)
            reset(); 
          break;
        default:
          break;
      }
      kvs_on_event(&ctx, &event);
    }
    kvs_run_task_queue(&ctx);

    bool running;

    kvs_on_render(&ctx);
}

int main(int argc, char *argv[]) {
  _argc = argc;
  for (size_t i = 0; i < argc; i++)
  {
    _argv[i] = argv[i];
  }

  SDL_Init(SDL_INIT_EVERYTHING);

  SDL_SetHint(SDL_HINT_OPENGL_ES_DRIVER, "1");
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
  SDL_GL_SetAttribute(SDL_GL_RED_SIZE, 8);
  SDL_GL_SetAttribute(SDL_GL_GREEN_SIZE, 8);
  SDL_GL_SetAttribute(SDL_GL_BLUE_SIZE, 8);
  SDL_GL_SetAttribute(SDL_GL_STENCIL_SIZE, 8);

  init();  

  while(!quit){
    Uint32 t = SDL_GetTicks();
    update();
    t = 15-(t-SDL_GetTicks());
    if(t > 0) SDL_Delay(t);
  }

  dispose();
}