#include <stdbool.h>

#include <duktape.h>
#include <soloud_c.h>

#include "js.h"

static Soloud* soloud;

duk_ret_t js_souloud_wav_create(duk_context *ctx)
{
    Wav* ptr = Wav_create();
    duk_push_pointer(ctx, ptr);
    return 1;
}

duk_ret_t js_souloud_wavstream_create(duk_context *ctx)
{
    WavStream* ptr = WavStream_create();
    duk_push_pointer(ctx, ptr);
    return 1;
}

duk_ret_t js_souloud_wav_destroy(duk_context *ctx)
{
    Wav* ptr = duk_require_pointer(ctx,0);
    if(ptr != NULL) Wav_destroy(ptr);
    return 0;
}

duk_ret_t js_souloud_wavstream_destroy(duk_context *ctx)
{
    WavStream* ptr = duk_require_pointer(ctx,0);
    if(ptr != NULL) WavStream_destroy(ptr);
    return 0;
}

duk_ret_t js_souloud_wav_volume(duk_context *ctx)
{
    Wav* ptr = duk_require_pointer(ctx,0);
    float volume = duk_require_number(ctx, 1);
    if(ptr != NULL) Wav_setVolume(ptr, volume);
    return 0;
}

duk_ret_t js_souloud_wavstream_volume(duk_context *ctx)
{
    WavStream* ptr = duk_require_pointer(ctx,0);
    float volume = duk_require_number(ctx, 1);
    if(ptr != NULL) WavStream_setVolume(ptr, volume);
    return 0;
}

duk_ret_t js_souloud_wav_repeat(duk_context *ctx)
{
    Wav* ptr = duk_require_pointer(ctx,0);
    bool loop = duk_require_boolean(ctx, 1);
    if(ptr != NULL) Wav_setLooping(ptr, loop);
    return 0;
}

duk_ret_t js_souloud_wavstream_repeat(duk_context *ctx)
{
    WavStream* ptr = duk_require_pointer(ctx,0);
    bool loop = duk_require_boolean(ctx, 1);
    if(ptr != NULL) WavStream_setLooping(ptr, loop);
    return 0;
}

duk_ret_t js_souloud_wav_load(duk_context *ctx)
{
    Wav* ptr = duk_require_pointer(ctx,0);
    const char* file = duk_require_string(ctx, 1);
    if(ptr != NULL) Wav_load(ptr, file);
    return 0;
}

duk_ret_t js_souloud_wavstream_load(duk_context *ctx)
{
    WavStream* ptr = duk_require_pointer(ctx,0);
    const char* file = duk_require_string(ctx, 1);
    if(ptr != NULL) WavStream_load(ptr, file);
    return 0;
}

duk_ret_t js_souloud_play(duk_context *ctx)
{
    AudioSource* ptr = duk_require_pointer(ctx,0);
    if(ptr != NULL) duk_push_uint(ctx, Soloud_play(soloud, ptr));
    return 1;
}

duk_ret_t js_souloud_isPlaying(duk_context *ctx)
{
    unsigned int handle = duk_require_uint(ctx,0);
    duk_push_boolean(ctx, Soloud_isValidVoiceHandle(soloud, handle));
    return 1;
}

 static const duk_function_list_entry my_module_funcs[] = {
      { "wav_create", js_souloud_wav_create, 0 },
      { "wavstream_create", js_souloud_wavstream_create, 0 },
      { "wav_destroy", js_souloud_wav_destroy, 1 },
      { "wavstream_destroy", js_souloud_wavstream_destroy, 1 },
      { "wav_volume", js_souloud_wav_volume, 2 },
      { "wavstream_volume", js_souloud_wavstream_volume, 2 },
      { "wav_repeat", js_souloud_wav_repeat, 2 },
      { "wavstream_repeat", js_souloud_wavstream_repeat, 2 },
      { "wav_load", js_souloud_wav_load, 2 },
      { "wavstream_load", js_souloud_wavstream_load, 2 },
      { "play", js_souloud_play, 1 },
      { "isPlaying", js_souloud_isPlaying, 1 },
      { NULL, NULL, 0 }
  };



void kvs_init_audio(KVS_Context* ctx){

    soloud = ctx->soloud;

    duk_context* vm = ctx->vm;
    duk_push_global_object(vm);
    duk_push_object(vm);
    duk_put_function_list(vm, -1, my_module_funcs);
    duk_put_prop_string(vm, -2, "soloud");
    duk_pop(vm);

}