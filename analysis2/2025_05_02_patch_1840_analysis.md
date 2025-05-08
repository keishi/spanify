# Build Failure Analysis: 2025_05_02_patch_1840

## First error

../../gpu/command_buffer/service/raster_decoder_autogen.h:89:29: error: no viable conversion from 'const volatile GLuint *' (aka 'const volatile unsigned int *') to 'base::span<const volatile GLuint>' (aka 'span<const volatile unsigned int>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `DeleteQueriesEXTHelper` was spanified, but the call site `DeleteQueriesEXTHelper(n, queries)` is inside `raster_decoder_autogen.h`. Since `raster_decoder_autogen.h` is auto generated, it is excluded from rewriting. The rewriter should have avoided spanifying functions that require spanifying excluded code.

## Solution
Do not spanify functions that require rewriting excluded code.

## Note
No other errors found.