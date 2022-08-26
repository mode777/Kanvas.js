cmake_minimum_required(VERSION 3.6)
project(Kanvas)
list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

include(cmake/TargetArch.cmake)
target_architecture(TARGET_ARCH)

message("Building for ${TARGET_ARCH}")

#set(CMAKE_FIND_DEBUG_MODE true)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})

# Add SDL
if(WIN32)
  if(TARGET_ARCH STREQUAL "x86_32")
    set(CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/sdl2/win32/x86)
  endif()
  if(TARGET_ARCH STREQUAL "x86_64")
    set(CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/sdl2/win32/x64)
  endif()
  #set(SDL2_BUILDING_LIBRARY on)
endif()

find_package(SDL2 REQUIRED)

# Add GLES2
if(WIN32)
  if(TARGET_ARCH STREQUAL "x86_32")
    set(CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/win32/x86)
    set(EGL_LIBRARY ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/win32/x86/bin/libEGL.dll.lib)
    set(OPENGLES2_LIBRARY ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/win32/x86/bin/libGLESv2.dll.lib)
  endif()
  if(TARGET_ARCH STREQUAL "x86_64")
    set(CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/win32/x64)
    set(EGL_LIBRARY ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/win32/x64/bin/libEGL.dll.lib)
    set(OPENGLES2_LIBRARY ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/win32/x64/bin/libGLESv2.dll.lib)
  endif()
endif()

if(APPLE AND "${CMAKE_HOST_SYSTEM_PROCESSOR}" STREQUAL "arm64")
  set(CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/mac_arm64)
  set(EGL_LIBRARY ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/mac_arm64/bin/libEGL.dylib)
  set(OPENGLES2_LIBRARY ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty/angle/mac_arm64/bin/libGLESv2.dylib)
endif()

find_package(EGL REQUIRED)
find_package(OpenGLES2 REQUIRED)

# Add STB libs
add_library(stb_image INTERFACE)
add_library(stb_ds INTERFACE)
add_library(stb_rect_pack INTERFACE)
#add_library(stb_image_write INTERFACE)
#add_library(stb_image_resize INTERFACE)
target_include_directories(stb_image INTERFACE thirdparty/stb)
target_include_directories(stb_ds INTERFACE thirdparty/stb)
target_include_directories(stb_rect_pack INTERFACE thirdparty/stb)
#target_include_directories(stb_image_write INTERFACE thirdparty/stb)
#target_include_directories(stb_image_resize INTERFACE thirdparty/stb)

# Add Nanovg
file(GLOB_RECURSE nanovg_sources thirdparty/nanovg/src/*.c)
file(GLOB_RECURSE nanovg_headers thirdparty/nanovg/src/*.h)
add_library(nanovg STATIC ${nanovg_sources} ${nanovg_headers})
target_include_directories(nanovg PUBLIC thirdparty/nanovg/src)

# Add Duktape
set(DUKTAPEDIR ${CMAKE_CURRENT_LIST_DIR}/thirdparty/duktape_combine)
add_library(duktape STATIC ${DUKTAPEDIR}/duktape.c)
target_include_directories(duktape PUBLIC ${DUKTAPEDIR})
if("${CMAKE_SYSTEM_NAME}" MATCHES "Linux")
  target_link_libraries(duktape
    m dl rt
  )
endif()

# Add Kanvas executable
file(GLOB_RECURSE sources src/*.c)
file(GLOB_RECURSE headers src/*.h)

add_executable(kanvas ${headers} ${sources})

target_link_libraries(kanvas PRIVATE EGL::EGL OpenGLES2::OpenGLES2 SDL2::Main nanovg duktape)

# Add emscripten configuration
if(EMSCRIPTEN)
  target_include_directories(kanvas PRIVATE thirdparty/emscripten)
  # set(CMAKE_EXECUTABLE_SUFFIX ".html")
  target_compile_options(kanvas PRIVATE "-O3")
  #target_link_libraries(kanvas PRIVATE "-s ASYNCIFY -O3 -lidbfs.js -s EXPORTED_FUNCTIONS='[\"_sst_web_vm_interpret\",\"_sst_web_vm_set_paused\",\"_sst_web_vram_read_pixel\",\"_main\"]' -s EXPORTED_RUNTIME_METHODS='[\"ccall\",\"cwrap\"]' --preload-file ../glsl --preload-file ../example --preload-file ../wren")
  target_link_libraries(kanvas PRIVATE "-s ASYNCIFY -s 'ASYNCIFY_IMPORTS=[\"do_fetch\",\"do_fetch_zip\"]' -O3 -lidbfs.js -s EXPORTED_FUNCTIONS='[\"_sst_web_vm_interpret\",\"_sst_web_vm_set_paused\",\"_sst_web_vram_read_pixel\",\"_sst_web_system_loadGame\",\"_main\"]' -s EXPORTED_RUNTIME_METHODS='[\"ccall\",\"cwrap\"]'")
endif()

# Needed by SDL for console by mingw
if(CMAKE_BUILD_TYPE STREQUAL "Debug" AND WIN32)
  target_link_options(kanvas PRIVATE "-mconsole")
endif()

# On windows copy dlls to bin dir
if(WIN32)
  configure_file(${SDL2_INCLUDE_DIRS}/../../bin/SDL2.dll ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/SDL2.dll COPYONLY)
  configure_file(${EGL_INCLUDE_DIR}/../bin/libEGL.dll ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/libEGL.dll COPYONLY)
  configure_file(${EGL_INCLUDE_DIR}/../bin/libGLESv2.dll ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/libGLESv2.dll COPYONLY)
endif()
