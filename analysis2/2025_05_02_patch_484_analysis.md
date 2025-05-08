# Build Failure Analysis: 2025_05_02_patch_484

## First error

../../gpu/command_buffer/service/raster_decoder_autogen.h:66:31: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `RasterDecoderImpl::GenQueriesEXTHelper` was spanified, but the call site in `../../gpu/command_buffer/service/raster_decoder_autogen.h` is still passing a raw `GLuint*` pointer. The compiler cannot implicitly convert a raw pointer to a `base::span`. This indicates a failure in the rewriter to update the call site after spanifying the function declaration.

## Solution
The rewriter needs to identify all call sites of spanified functions and ensure that the arguments are appropriately converted to `base::span` when necessary. In this specific case, the rewriter should either:

1.  Modify `GenQueriesEXTHelper` not to require span.
2.  Spanify `DoGenQueriesEXT` so it matches the spanified signature.

## Note
The same error happens in `gles2_cmd_decoder.cc` due to the same reason. The rewriter should identify all call sites of spanified functions.