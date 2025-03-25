```
# Build Failure Analysis: 2025_03_19_patch_1516

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4137:27: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The error occurs because `DoVertexAttrib4fv` in `gles2_cmd_decoder.cc` was spanified, but the corresponding call site in `gles2_cmd_decoder_autogen.h` (generated code and thus excluded from spanification) is still passing a raw pointer. This mismatch causes a type conversion error, as the compiler can't implicitly convert a raw pointer to a `base::span`.

## Solution
The rewriter should avoid spanifying functions if doing so requires modifying code that is excluded from spanification. In this case, `gles2_cmd_decoder_autogen.h` is generated code, so it is excluded from the rewriter. Thus, the rewriter shouldn't spanify `DoVertexAttrib4fv` since it is called in the generated code.

## Note
This is generated code, so ideally the rewriter should detect it and not try to rewrite code that calls into it, or is called by it. The rewriter is also failing to handle the `volatile` qualifier.