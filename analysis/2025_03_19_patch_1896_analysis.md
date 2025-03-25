# Build Failure Analysis: 2025_03_19_patch_1896

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:1940:52: error: explicit instantiation of 'PatchGetBufferResults' does not refer to a function template, variable template, member function, member class, or static data member
 1940 | template error::Error GLES2DecoderPassthroughImpl::PatchGetBufferResults(
      |                                                    ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The code attempts to explicitly instantiate a member function template. However, the spanified function parameter `base::span<T>` causes the explicit instantiation to fail, because the compiler cannot resolve the template argument `T`. The `PatchGetBufferResults` function is explicitly instantiated for different `T` types (GLBoolean, GLint, etc.). Because this code is excluded from the rewriter, it can't rewrite those instantiations. The explicit instantiations are for the original function signature.

## Solution
The rewriter should not spanify `PatchGetBufferResults` because it is explicitly instantiated. Or, all explicit instantiations of that function must be rewritten to span as well. Note that the code must be modified in the header as well.