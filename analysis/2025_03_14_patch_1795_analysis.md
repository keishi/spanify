# Build Failure Analysis: 2025_03_14_patch_1795

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:1726:22: error: cannot initialize a parameter of type 'DeleteFn' (aka 'void (GLES2Implementation::*)(GLsizei, const GLuint *)') with an rvalue of type 'void (gpu::gles2::GLES2Implementation::*)(GLsizei, base::span<const GLuint>)'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. Specifically, the `DeleteSyncStub` function was spanified, but the call to `helper_->DeleteSync` in `GLES2Implementation::DeleteSyncHelper` was not updated to pass a span. This resulted in a type mismatch, as the function pointer `DeleteFn` expects a `const GLuint*`, but is receiving a `base::span<const GLuint>`.

## Solution
The rewriter needs to ensure that all call sites of spanified functions are also updated to use spans. In this case, the `DeleteSyncHelper` function needs to be updated to use a span when calling `DeleteSync`. Because the `DeleteSyncHelper` function isn't spanified, but it needs to call spanified functions, it can be updated with a `base::span` as follows:

```c++
void GLES2Implementation::DeleteSyncHelper(GLsync sync) {
  if (sync) {
+    GLuint sync_array[1] = {sync};
+    base::span<const GLuint> syncs(sync_array);
-    helper_->DeleteSync(sync);
+    helper_->DeleteSync(syncs);
  }
}
```

## Note
The build log shows multiple failures related to the `gles2_cmd_decoder.o` build. This suggests there may be other similar issues in that file or related files, where functions have been spanified but call sites have not been updated.