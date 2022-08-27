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

# Macos copy dylibs
if(APPLE)
  #configure_file(${SDL2_INCLUDE_DIRS}/../../bin/SDL2.dll ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/SDL2.dll COPYONLY)
  configure_file(${EGL_INCLUDE_DIR}/../bin/libEGL.dylib ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/libEGL.dylib COPYONLY)
  configure_file(${EGL_INCLUDE_DIR}/../bin/libGLESv2.dylib ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/libGLESv2.dylib COPYONLY)
endif()
