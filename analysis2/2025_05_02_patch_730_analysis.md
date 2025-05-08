# Build Failure Analysis: 2025_05_02_patch_730

## First error

```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1204:29: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
 1204 |       !GenSamplersHelper(n, samplers_safe)) {
      |                             ^~~~~~~~~~~~~
```

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The error "no viable conversion from 'GLuint *' to 'base::span<const GLuint>'" indicates that the rewriter has changed the function signature of `GLES2DecoderImpl::GenSamplersHelper` to accept a `base::span<const GLuint>` as the `client_ids` argument. However, the call site in `gles2_cmd_decoder_autogen.h` (generated code) passes a `GLuint*` (raw pointer) to this function. Since `gles2_cmd_decoder_autogen.h` is generated, it is excluded, so the rewriter cannot update the call site.

## Solution
The rewriter should not spanify the `GLES2DecoderImpl::GenSamplersHelper` function if it requires spanifying excluded code (`gles2_cmd_decoder_autogen.h`).

## Note
This error is similar to the existing category "Rewriter needs to avoid spanifying functions if it requires spanifying excluded code."