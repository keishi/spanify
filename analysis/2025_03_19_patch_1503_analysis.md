# Build Failure Analysis: 2025_03_19_patch_1503

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:3442:9: error: no matching conversion for functional-style cast from 'int64_t *' (aka 'long *') to 'base::span<int64_t, 1>' (aka 'span<long, 1>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to pass a raw pointer to a function that now accepts a span. The size information for the pointer is available at the callsite because a pointer to a single element is being used, but the rewriter is not recognizing it. The rewriter should have generated `base::span<int64_t, 1>(&caps.max_combined_fragment_uniform_components, 1)`

## Solution
The rewriter failed to handle size info available rhs value. It should now be able to rewrite it.

## Note
The same error happens at lines 3448, 3452 and 3478. Also, the error happens in DoGetInteger64v().
Also, the declaration of DoGetInteger64v should have a non-optional span.