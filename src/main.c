#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include <SDL.h>
#include <GLES2/gl2.h>
//#include <EGL/egl.h>
#include <duktape.h>

#include "js.h"
#include "js_nanovg.h"

#ifdef EMSCRIPTEN
#include <emscripten/emscripten.h>
#endif

static duk_context* vm;
static SDL_Event event;
static SDL_Window* window;
static bool quit;

static void update(){
    while(SDL_PollEvent(&event)){
      switch (event.type)
      {
        case SDL_QUIT:
          quit = true;
          break;
        default:
          break;
      }
    }

    int w,h;
    SDL_GL_GetDrawableSize(window, &w, &h);
    bool running;

    glClearColor(0.3f,0,0,1);
    glClear(GL_COLOR_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glEnable(GL_CULL_FACE);
    glDisable(GL_DEPTH_TEST);

    ink_js_nanovg_update(vm);
    
    SDL_GL_SwapWindow(window);
}

int main(int argc, char *argv[]) {

  SDL_Init(SDL_INIT_EVERYTHING);

  SDL_SetHint(SDL_HINT_OPENGL_ES_DRIVER, "1");
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
  SDL_GL_SetAttribute(SDL_GL_RED_SIZE, 8);
  SDL_GL_SetAttribute(SDL_GL_GREEN_SIZE, 8);
  SDL_GL_SetAttribute(SDL_GL_BLUE_SIZE, 8);
  SDL_GL_SetAttribute(SDL_GL_STENCIL_SIZE, 8);

  window = SDL_CreateWindow("SuperStation", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 640, 480, SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE | SDL_WINDOW_ALLOW_HIGHDPI);

  assert(window != NULL);

  SDL_GLContext* context = SDL_GL_CreateContext(window);
  SDL_GL_SetSwapInterval(0);

  assert(context != NULL);

  

  vm = ink_js_init();
  ink_js_nanovg_init(vm);
  ink_js_runFile(vm, "core.js");
  ink_js_runFile(vm, "ink.js");
  ink_js_runFile(vm, "main.js");


#ifdef EMSCRIPTEN
  SST_CALL_TERM(sst_web_init(&State))
  emscripten_set_main_loop(update, 0, 1);
#else
  while(!quit){
    Uint32 t = SDL_GetTicks();
    update();
    t = 15-(t-SDL_GetTicks());
    if(t > 0) SDL_Delay(t);
  }
#endif
}