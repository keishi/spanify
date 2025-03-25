# Build Failure Analysis: 2025_03_19_patch_1480

## First error

../../gpu/command_buffer/service/raster_decoder_autogen.h:66:31: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GenQueriesEXTHelper` was spanified, but the call site in `DoGenQueriesEXT` (which lives in generated code and is thus not spanified) is passing a raw pointer to `GenQueriesEXTHelper`.

## Solution
The rewriter needs to be able to recognize size info unavailable rhs value.

## Note
This call site is passing a raw pointer where the size is not available. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.