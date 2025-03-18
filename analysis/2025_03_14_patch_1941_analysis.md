# Build Failure Analysis: 2025_03_14_patch_1941

## First error

../../gpu/command_buffer/tests/gl_ext_blend_func_extended_unittest.cc:59:19: error: no matching function for call to 'Weight'
   59 |   r[0] = src[0] * Weight<RGBs, 0>(dst, src, src1) +
      |                   ^~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `BlendEquationFuncAdd`, but failed to spanify the call site to `Weight`. This caused a type mismatch because the `Weight` function expects a `float *` as the first argument, but `BlendEquationFuncAdd` is passing a `base::span<float, 4>`.

## Solution
The rewriter needs to spanify the call sites of spanified functions. The rewriter needs to identify calls to Weight that expect `float*` but receive `base::span<float, 4>`, and then generate the appropriate code such as `dst.data()` at the call site.

## Note
The build log has more errors all stemming from this root cause.