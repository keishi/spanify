# Build Failure Analysis: 2025_05_02_patch_1072

## First error

../../base/containers/vector_buffer_unittest.cc:72:40: error: invalid operands to binary expression ('base::span<base::MoveOnlyInt>' and 'int')
   72 |     new (UNSAFE_BUFFERS(buffer.begin() + i)) MoveOnlyInt(i + 1);
      |                         ~~~~~~~~~~~~~~ ^ ~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter changed `begin()` to return `base::span<T>`, but didn't update all the call sites to use `subspan()`. In this case, `buffer.begin() + i` is trying to use pointer arithmetic directly on the `span` object, which is not allowed.

## Solution
The rewriter should have converted `buffer.begin() + i` into `buffer.begin().subspan(i)`.

```
EmitReplacement(
      key, GetReplacementDirective(
               source_range,
               llvm::formatv("{0}.subspan({1})", rhs_array_type ? ")" : "",
                             initial_text.substr(1)),
               source_manager));