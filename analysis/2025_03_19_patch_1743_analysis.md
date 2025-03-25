# Build Failure Analysis: 2025_03_19_patch_1743

## First error

../../mojo/core/data_pipe_unittest.cc:719:12: error: no viable overloaded '='
  719 |   elements = static_cast<int32_t*>(buffer);
      |   ~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter doesn't handle assignment of spanified variable from a cast.

## Reason
The variable `elements` was spanified. The original code attempts to assign a C-style cast to it, which is no longer compatible with the `base::span` type. The cast is from a `void*` to an `int32_t*`.  The rewriter failed to recognize this as valid source code to create a span from, so we get a type error.

## Solution
The rewriter should recognize the cast and create a span from it. One solution is to use `base::make_span` with the cast as the first argument and then the number of elements. Or just use `static_cast<base::span<int32_t>>` so it compiles out of the box without any help from the rewriter.

## Note
None