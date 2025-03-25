# Build Failure Analysis: 2025_03_19_patch_630

## First error

../../gpu/command_buffer/client/gles2_implementation_impl_autogen.h:1934:40: error: no viable conversion from 'const GLint *' (aka 'const int *') to 'base::span<const GLint>' (aka 'span<const int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
`GLES2Implementation::PackStringsToBucket` has been spanified. The original code was passing a raw pointer `length` into this function at `gles2_implementation_impl_autogen.h:1934`. The rewriter should have detected this raw pointer and realized that it is not possible to get the size info.

## Solution
Rewriter needs to be able to recognize size info unavailable rhs value. The call site needs to be fixed such that either a nullptr is passed into the length parameter, or a base::span is created at the callsite.

```
-  if (!PackStringsToBucket(count, str, length, "glShaderSource")) {
+  if (!PackStringsToBucket(count, str, base::span<const GLint>(), "glShaderSource")) {
```

## Note
The rewriter encountered a similar error at `gpu/command_buffer/client/gles2_implementation.cc:1799`. This should be addressed at the same time.