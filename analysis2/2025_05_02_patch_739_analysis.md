# Build Failure Analysis: 2025_05_02_patch_739

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1294:24: error: no viable conversion from 'GLboolean *' (aka 'unsigned char *') to 'base::span<GLboolean>' (aka 'span<unsigned char>')
 1294 |   DoGetBooleanv(pname, params, num_values);

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GLES2DecoderImpl::DoGetBooleanv` was spanified, but the call site in `gles2_cmd_decoder_autogen.h` passes a raw `GLboolean*` pointer. The rewriter failed to update this call site to use a `base::span`. `gles2_cmd_decoder_autogen.h` is generated code, which might have contributed to the rewriter's failure to update the call site.

## Solution
The rewriter needs to spanify call sites of spanified functions, especially when dealing with generated code. The rewriter must recognize that `GLboolean* params` is semantically a buffer with `num_values` elements and should be converted to a span at the call site.

## Note
The header `gles2_cmd_decoder_autogen.h` is a generated file which may have interfered with the rewriter's ability to apply the span conversion at the call site. This may fall under the category "Rewriter needs to avoid spanifying functions if it requires spanifying excluded code."