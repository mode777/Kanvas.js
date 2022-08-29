#include <stb_ds.h>
#include <SDL.h>

#include "js.h"


static struct { SDL_KeyCode key; const char* value; } *hash = NULL;

void kvs_init_keys(){
    hmput(hash,SDLK_BACKSPACE,"Backspace");
    hmput(hash,SDLK_TAB,"Tab");
    hmput(hash,SDLK_RETURN,"Enter");
    hmput(hash,SDLK_LSHIFT,"Shift");
    hmput(hash,SDLK_RSHIFT,"Shift");
    hmput(hash,SDLK_LCTRL,"Control");
    hmput(hash,SDLK_RCTRL,"Control");
    hmput(hash,SDLK_LALT,"Alt");
    hmput(hash,SDLK_RALT,"Alt");
    hmput(hash,SDLK_PAUSE,"Pause");
    hmput(hash,SDLK_CAPSLOCK,"CapsLock");
    hmput(hash,SDLK_ESCAPE,"Escape");
    hmput(hash,SDLK_SPACE," ");
    hmput(hash,SDLK_PAGEUP,"PageUp");
    hmput(hash,SDLK_PAGEDOWN,"PageDown");
    hmput(hash,SDLK_END,"End");
    hmput(hash,SDLK_HOME,"Home");
    hmput(hash,SDLK_LEFT,"ArrowLeft");
    hmput(hash,SDLK_UP,"ArrowUp");
    hmput(hash,SDLK_RIGHT,"ArrowRight");
    hmput(hash,SDLK_DOWN,"ArrowDown");
    hmput(hash,SDLK_PRINTSCREEN,"PrintScreen");
    hmput(hash,SDLK_INSERT,"Insert");
    hmput(hash,SDLK_DELETE,"Delete");
    hmput(hash,SDLK_0,"0");
    hmput(hash,SDLK_1,"1");
    hmput(hash,SDLK_2,"2");
    hmput(hash,SDLK_3,"3");
    hmput(hash,SDLK_4,"4");
    hmput(hash,SDLK_5,"5");
    hmput(hash,SDLK_6,"6");
    hmput(hash,SDLK_7,"7");
    hmput(hash,SDLK_8,"8");
    hmput(hash,SDLK_9,"9");
    hmput(hash,SDLK_a,"a");
    hmput(hash,SDLK_b,"b");
    hmput(hash,SDLK_c,"c");
    hmput(hash,SDLK_d,"d");
    hmput(hash,SDLK_e,"e");
    hmput(hash,SDLK_f,"f");
    hmput(hash,SDLK_g,"g");
    hmput(hash,SDLK_h,"h");
    hmput(hash,SDLK_i,"i");
    hmput(hash,SDLK_j,"j");
    hmput(hash,SDLK_k,"k");
    hmput(hash,SDLK_l,"l");
    hmput(hash,SDLK_m,"m");
    hmput(hash,SDLK_n,"n");
    hmput(hash,SDLK_o,"o");
    hmput(hash,SDLK_p,"p");
    hmput(hash,SDLK_q,"q");
    hmput(hash,SDLK_r,"r");
    hmput(hash,SDLK_s,"s");
    hmput(hash,SDLK_t,"t");
    hmput(hash,SDLK_u,"u");
    hmput(hash,SDLK_v,"v");
    hmput(hash,SDLK_w,"w");
    hmput(hash,SDLK_x,"x");
    hmput(hash,SDLK_y,"y");
    hmput(hash,SDLK_z,"z");
    hmput(hash,SDLK_LGUI,"Meta");
    hmput(hash,SDLK_RGUI,"Meta");
    hmput(hash,SDLK_APPLICATION,"ContextMenu");
    hmput(hash,SDLK_KP_0,"0");
    hmput(hash,SDLK_KP_1,"1");
    hmput(hash,SDLK_KP_2,"2");
    hmput(hash,SDLK_KP_3,"3");
    hmput(hash,SDLK_KP_4,"4");
    hmput(hash,SDLK_KP_5,"5");
    hmput(hash,SDLK_KP_6,"6");
    hmput(hash,SDLK_KP_7,"7");
    hmput(hash,SDLK_KP_8,"8");
    hmput(hash,SDLK_KP_9,"9");
    hmput(hash,SDLK_KP_MULTIPLY,"*");
    hmput(hash,SDLK_KP_PLUS,"+");
    hmput(hash,SDLK_KP_MINUS,"-");
    hmput(hash,SDLK_KP_PERIOD,".");
    hmput(hash,SDLK_KP_DIVIDE,"/");
    hmput(hash,SDLK_F1,"F1");
    hmput(hash,SDLK_F2,"F2");
    hmput(hash,SDLK_F3,"F3");
    hmput(hash,SDLK_F4,"F4");
    hmput(hash,SDLK_F5,"F5");
    hmput(hash,SDLK_F6,"F6");
    hmput(hash,SDLK_F7,"F7");
    hmput(hash,SDLK_F8,"F8");
    hmput(hash,SDLK_F9,"F9");
    hmput(hash,SDLK_F10,"F10");
    hmput(hash,SDLK_F11,"F11");
    hmput(hash,SDLK_F12,"F12");
    hmput(hash,SDLK_NUMLOCKCLEAR,"NumLock");
    hmput(hash,SDLK_SCROLLLOCK,"ScrollLock");
    hmput(hash,SDLK_MUTE,"AudioVolumeMute");
    hmput(hash,SDLK_VOLUMEDOWN,"AudioVolumeDown");
    hmput(hash,SDLK_VOLUMEUP,"AudioVolumeUp");
    hmput(hash,SDLK_MEDIASELECT,"LaunchMediaPlayer");
    hmput(hash,SDLK_APP1,"LaunchApplication1");
    hmput(hash,SDLK_APP2,"LaunchApplication2");
    hmput(hash,SDLK_SEMICOLON,";");
    hmput(hash,SDLK_EQUALS,"=");
    hmput(hash,SDLK_COMMA,",");
    hmput(hash,SDLK_MINUS,"-");
    hmput(hash,SDLK_PERIOD,".");
    hmput(hash,SDLK_SLASH,"/");
    hmput(hash,SDLK_BACKQUOTE,"`");
    hmput(hash,SDLK_LEFTBRACKET,"[");
    hmput(hash,SDLK_BACKSLASH,"\\");
    hmput(hash,SDLK_RIGHTBRACKET,"]");
    hmput(hash,SDLK_QUOTE,"'");
}

const char* kvs_get_key(SDL_Keycode sym){
    return hmget(hash, sym);
}