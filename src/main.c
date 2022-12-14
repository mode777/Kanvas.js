#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include <SDL.h>
#include <GLES2/gl2.h>
//#include <EGL/egl.h>
#include <duktape.h>
#include <soloud_c.h>

#include "js.h"

static int _argc;
static char* _argv[16];
static SDL_Event event;
static KVS_Context ctx;
static bool quit;



static void init(){
  kvs_init(&ctx, "kanvas.json");
  //printf("a: %d\n",duk_get_top_index(ctx.vm));
  kvs_init_keys();
  //printf("b: %d\n",duk_get_top_index(ctx.vm));
  kvs_init_fs(&ctx);
  //printf("c: %d\n",duk_get_top_index(ctx.vm));
  //kvs_nanovg_init(&ctx);
  //printf("d: %d\n",duk_get_top_index(ctx.vm));
  kvs_init_audio(&ctx);

  kvs_run_file(&ctx, "./polyfills.js");
  //printf("e: %d\n",duk_get_top_index(ctx.vm));
  //kvs_run_file(&ctx, "./thirdparty/duktape/polyfills/promise.js");
  if(_argc == 1){
    kvs_run_file(&ctx, "./main.js");
  } else {
    for (size_t i = 1; i < _argc; i++)
    {
        kvs_run_file(&ctx, _argv[i]);
    } 
  }
}

static void dispose(){
  kvs_dispose(&ctx);
  //kvs_nanovg_dispose();
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
      kvs_run_task_queue(&ctx);
    }

    bool running;

    kvs_on_render(&ctx);
}

int main(int argc, char *argv[]) {

  // Wav* wav = Wav_create();
  // Wav_load(wav, "assets/audio/sfx/cardShuffle.ogg");

  // WavStream* wav2 = WavStream_create();
  // WavStream_load(wav2, "assets/audio/bgm/mystical_theme.mp3");
  
  // Soloud_setGlobalVolume(soloud, 4);
  // Soloud_play(soloud, wav);
  // Soloud_play(soloud, wav2);


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

  ctx.soloud = Soloud_create();
  Soloud_initEx(ctx.soloud, SOLOUD_CLIP_ROUNDOFF | SOLOUD_ENABLE_VISUALIZATION, 
                SOLOUD_AUTO, SOLOUD_AUTO, SOLOUD_AUTO, SOLOUD_AUTO);

  init();  

  while(!quit){
    Uint32 t = SDL_GetTicks();
    update();
    t = 14-(t-SDL_GetTicks());
    if(t > 0) SDL_Delay(t);
  }

  dispose();
}