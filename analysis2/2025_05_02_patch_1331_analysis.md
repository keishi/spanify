# Build Failure Analysis: 2025_05_02_patch_1331

## First error

../../gpu/command_buffer/service/gl_utils.cc:173:59: error: no viable conversion from 'base::span<GLint>' (aka 'span<int>') to 'GLint *' (aka 'int *')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `QueryShaderPrecisionFormat` was spanified, but the call site `glGetShaderPrecisionFormat` expects a `GLint*` (aka `int*`) but receives a `base::span<GLint>` (aka `span<int>`).  The rewriter failed to spanify the call site.

## Solution
The rewriter should spanify the call site, or decay the span to a pointer by using `.data()`. The preferred solution is to spanify the call site.
```c++
 glGetShaderPrecisionFormat(shader_type, precision_type, range, precision);
```
needs to become
```c++
 glGetShaderPrecisionFormat(shader_type, precision_type, range.data(), precision);
```

## Note
The function `glGetShaderPrecisionFormat` is a system function, which should be excluded from the rewriter. Thus the rewriter needs to add `.data()` to decay span `range` to a pointer.