# Build Failure Analysis: 2025_03_19_patch_204

## First error

../../gpu/command_buffer/service/raster_decoder_autogen.h:89:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')
   89 |   DeleteQueriesEXTHelper(n, queries);
      |                             ^~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to spanify the `DeleteQueriesEXTHelper` function, however, the call site of the function resides in `raster_decoder_autogen.h`, a generated file. Since generated files are excluded from spanification, the rewriter should not modify function signatures if the function is called in excluded code.

## Solution
Rewriter should avoid spanifying functions that require spanifying excluded code. The rewriter should detect this situation and not attempt to spanify the function.

## Note
There were no other errors.