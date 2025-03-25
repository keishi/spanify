# Build Failure Analysis: 2025_03_19_patch_964

## First error

../../third_party/blink/renderer/core/html/parser/literal_buffer.h:178:16: error: field 'inline_storage' is uninitialized when used here [-Werror,-Wuninitialized]
  178 |   T* begin_ = &inline_storage[0];
      |                ^

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter changed `T inline_storage[BUFFER_INLINE_CAPACITY];` to `std::array<T, BUFFER_INLINE_CAPACITY> inline_storage;` which caused `inline_storage` to no longer be implicitly initialized to zero. As a result, when begin_ is assigned a value, inline_storage is uninitialized, causing the compiler to throw an error. To fix it, the rewriter should be able to properly initialize the `inline_storage`.

## Solution
Initialize the `std::array` in the constructor. `T* begin_ = &inline_storage[0];` will read the contents of uninitialized `inline_storage` if `T` has no default constructor. `inline_storage` should be initialized with `{}`.

```diff
--- a/third_party/blink/renderer/core/html/parser/literal_buffer.h
+++ b/third_party/blink/renderer/core/html/parser/literal_buffer.h
@@ -174,7 +174,7 @@ class LiteralBufferBase {
 
 protected:
   T* begin_ = &inline_storage[0];
-  T* end_ = begin_;
+  T* end_ = begin_; 
   T* end_of_storage_ = UNSAFE_TODO(begin_ + BUFFER_INLINE_CAPACITY);
   T inline_storage[BUFFER_INLINE_CAPACITY];
 };

```

## Note
This looks like a duplicate of https://bugs.chromium.org/p/chromium/issues/detail?id=1533435.