cmake_minimum_required(VERSION 3.13)
include(pico_sdk_import.cmake)

project(shannon_pico_project C CXX ASM)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

pico_sdk_init()

add_executable(shannon_pico_runner
    main.c
)

target_include_directories(shannon_pico_runner PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}
    ${CMAKE_CURRENT_LIST_DIR}/../../compiler/models
)

target_link_libraries(shannon_pico_runner
    pico_stdlib
    hardware_timer
)

pico_add_extra_outputs(shannon_pico_runner)
