# Build Failure Analysis: 2025_03_15_patch_1308

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16354:38: error: no viable conversion from 'std::array<GLenum, 16>' (aka 'array<unsigned int, 16>') to 'const GLenum *' (aka 'const unsigned int *')
 16354 |     api()->glDrawBuffersARBFn(count, safe_bufs);
       |                                      ^~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array to `std::array`, but it is being passed to a third_party function call `api()->glDrawBuffersARBFn`. The rewriter should add `.data()` to the `std::array` variable when that variable is passed to a third_party function call.

## Solution
The rewriter should recognize this pattern and add .data() to the `std::array` variable when it is passed to a third_party function call.

## Note
NA