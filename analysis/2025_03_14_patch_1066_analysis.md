```
# Build Failure Analysis: 2025_03_14_patch_1066

## First error

../../third_party/blink/renderer/core/html/parser/literal_buffer.h:178:16: error: field 'inline_storage' is uninitialized when used here [-Werror,-Wuninitialized]
  178 |   T* begin_ = &inline_storage[0];
      |                ^

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter spanified a C-style array to `std::array` which caused an uninitialized error because the members were initialized via pointer, and not default constructor. The rule was meant to handle nullptr initialization of spanified member field to `{}`, but it didn't work here.

## Solution
The rewriter should rewrite nullptr initialization of spanified member field to {}. This probably involves expanding the existing logic to handle `std::array` member initialization.

The rewriter should have rewritten the code as follows:

```c++
  T* begin_ = {};
  T* end_ = begin_;
  T* end_of_storage_ = UNSAFE_TODO(begin_ + BUFFER_INLINE_CAPACITY);
  std::array<T, BUFFER_INLINE_CAPACITY> inline_storage;
```

## Note
The fix should also be applied to other instances of `LiteralBufferBase`.