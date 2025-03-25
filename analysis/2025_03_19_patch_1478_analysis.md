# Build Failure Analysis: 2025_03_19_patch_1478

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:3310:38: error: no matching conversion for functional-style cast from 'int *' to 'base::span<int, 1>'

## Category
Rewriter failed to apply subspan rewrite to a spanified function parameter.

## Reason
The code attempts to create a `base::span<int, 1>` from an `int*` using a functional-style cast. However, there's no implicit conversion from a raw pointer to a `base::span`. The rewriter is not properly rewriting the call sites of the `DoGetIntegerv` function to correctly construct the `base::span`.

## Solution
The rewriter needs to be updated to handle the cases where a raw pointer is being passed as an argument to a spanified function parameter. The fix involves replacing the raw pointer with `base::make_span`, which correctly constructs a span from a raw pointer and a size: `base::make_span(&variable, 1)`.

## Note
The build log contains many similar errors. They all boil down to the same root cause.