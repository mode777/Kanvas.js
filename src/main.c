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
static duk_context* vm;
static SDL_Event event;
static SDL_Window* window;
static bool quit;

static void init(){
  vm = kvs_init();
  kvs_nanovg_init(vm);

  kvs_runFile(vm, "polyfills.js");
  if(_argc == 1){
    kvs_runFile(vm, "main.js");
  } else {
    for (size_t i = 1; i < _argc; i++)
    {
        kvs_runFile(vm, _argv[i]);
    } 
  }
}

static void dispose(){
  kvs_nanovg_dispose();
  duk_destroy_heap(vm);
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
        case SDL_MOUSEMOTION:
          kvs_on_mouse_move(vm, event.motion.x, event.motion.y);
          break;
        default:
          break;
      }
    }

    int w,h;
    SDL_GL_GetDrawableSize(window, &w, &h);
    bool running;

    kvs_on_render(vm);
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

  window = SDL_CreateWindow("Kanvas.js", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 640, 480, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE | SDL_WINDOW_ALLOW_HIGHDPI);

  assert(window != NULL);

  SDL_GLContext* context = SDL_GL_CreateContext(window);
  SDL_GL_SetSwapInterval(0);

  assert(context != NULL);

  init();  

  while(!quit){
    Uint32 t = SDL_GetTicks();
    update();
    t = 15-(t-SDL_GetTicks());
    if(t > 0) SDL_Delay(t);
  }

  dispose();
}