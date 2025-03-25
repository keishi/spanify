# Build Failure Analysis: 2025_03_19_patch_76

## First error

../../gpu/command_buffer/tests/gl_ext_blend_func_extended_unittest.cc:59:19: error: no matching function for call to 'Weight'

## Category
Pointer passed into spanified function parameter.

## Reason
The function Weight expects a float *, but the rewriter spanified BlendEquationFuncAdd, but not Weight. Therefore the call to Weight failed because it got a base::span.

## Solution
Rewriter needs to spanify Weight as well.

## Note
Rest of the errors are of the same nature.