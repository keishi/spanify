# Build Failure Analysis: 2025_05_02_patch_1672

## First error

../../gpu/command_buffer/client/gles2_implementation_autogen.h:206:67: error: non-virtual member function marked 'override' hides virtual member function

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The error indicates that the `DeleteTextures` function in `gles2_implementation_autogen.h` is being overridden with a different signature (specifically, changing `const GLuint* textures` to `base::span<const GLuint> textures`).  However, the base class `gpu::gles2::GLES2Interface` has `DeleteTextures` declared with the original pointer signature, and that file was not changed.

The `gles2_implementation_autogen.h` header is auto-generated, which makes it an excluded location for spanify.  Thus, the rewriter should not have attempted to change the signatures of functions defined in it. It also probably means that the tool should not have spanified `DeleteTextures` because `gpu::gles2::GLES2Interface::DeleteTextures` cannot be changed to a span.

## Solution
The rewriter should be updated to avoid spanifying functions where the changes would require spanifying files excluded from spanification.

## Note
The same error exists in `gpu/command_buffer/client/gles2_trace_implementation_autogen.h`, `gpu/command_buffer/client/gles2_interface_stub_autogen.h`, and `gpu/skia_bindings/gles2_implementation_with_grcontext_support.h`.

Also there is this error that appears later.

```
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:142:3: error: no matching function for call to 'DeleteTextures'
  gl_->DeleteTextures(n, ids);
  ^~~~
../../gpu/command_buffer/client/gles2_implementation_unittest.cc:4520:3: error: no matching function for call to 'DeleteTextures'
  gl_->DeleteTextures(1, &texture_id);
  ^~~~
../../gpu/command_buffer/client/gles2_implementation_unittest_autogen.h:479:3: error: no matching function for call to 'DeleteTextures'
  gl_->DeleteTextures(std::size(ids), ids);
  ^~~~
```

This indicates that the tests were not updated to match the spanified function signature.