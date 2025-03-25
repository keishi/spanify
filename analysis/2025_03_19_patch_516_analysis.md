# Build Failure Analysis: 2025_03_19_patch_516

## First error

../../gpu/command_buffer/service/gl_utils.cc:161:59: error: no viable conversion from 'base::span<GLint>' (aka 'span<int>') to 'GLint *' (aka 'int *')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The `QueryShaderPrecisionFormat` function was spanified:

```diff
-                                GLint* range,
+                                base::span<GLint> range,
```

However, the rewriter failed to spanify the call site:

```
   glGetShaderPrecisionFormat(shader_type, precision_type, range, precision);
```

The `range` variable is a `GLint*`, which the rewriter failed to recognize as requiring spanification.

## Solution
The rewriter needs to be able to recognize this pattern and rewrite the call site.

```diff
--- a/gpu/command_buffer/service/gl_utils.cc
+++ b/gpu/command_buffer/service/gl_utils.cc
@@ -158,5 +158,6 @@
 void QueryShaderPrecisionFormat(GLenum shader_type,
                                  GLenum precision_type,
                                 base::span<GLint> range,
                                  GLint* precision) {
   switch (precision_type) {

```

The call site would need to be changed to:

```c++
  GLint range[2];
  QueryShaderPrecisionFormat(shader_type, precision_type, base::span<GLint>(range), precision);
```

## Note
This fix involves a combination of both spanifying the function and updating the calling context. Ensure that the rewriter handles both aspects for a complete solution.