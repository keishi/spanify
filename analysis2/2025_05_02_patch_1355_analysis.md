# Build Failure Analysis: 2025_05_02_patch_1355

## First error

../../gpu/command_buffer/client/raster_implementation_impl_autogen.h:60:29: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `RasterImplementation::DeleteQueriesEXTHelper` was spanified. However, the call site is in `raster_implementation_impl_autogen.h`, which is generated code and should be excluded from spanification. The rewriter should not spanify functions that require changes in excluded code.

## Solution
The rewriter needs to check if spanifying a function will require changes in excluded code. If it does, the rewriter should avoid spanifying that function.

## Note
The file `raster_implementation_impl_autogen.h` is generated, so we should avoid rewriting code in it.