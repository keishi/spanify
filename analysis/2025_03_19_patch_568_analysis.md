# Build Failure Analysis: 2025_03_19_patch_568

## First error

../../third_party/libc++/src/include/array:553:17: error: static assertion failed due to requirement 'is_move_constructible_v<crashpad::StringAnnotation<64>>': [array.creation]/4: to_array requires move constructible elements.

## Category
Rewriter dropped mutable qualifier.

## Reason
The error indicates that `crashpad::StringAnnotation<64>` is not move constructible. Looking at the diff we see that this is because the rewriter replaced a `mutable` array with a `std::array`, implicitly removing the `mutable` qualifier. Because `crashpad::StringAnnotation<64>` has a deleted copy constructor and no move constructor, the `std::array` cannot be constructed.

## Solution
When converting an array to `std::array`, the rewriter must preserve the `mutable` qualifier.

## Note
The build log shows multiple errors related to the same root cause.
```
../../third_party/libc++/src/include/array:538:12: error: call to deleted constructor of 'crashpad::StringAnnotation<64>'
../../third_party/crashpad/crashpad/client/annotation.h:299:3: note: 'StringAnnotation' has been explicitly marked deleted here