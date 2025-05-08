# Build Failure Analysis: 2025_05_02_patch_222

## First error
Overlapping replacements: ./sandbox/linux/services/credentials.cc at offset 3289, length 8: ").subspan( sizeof)" and offset 3291, length 17: "(stack_buf.size() * sizeof(decltype(stack_buf)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to perform two conflicting replacements in the same area of code. The first replacement is related to `.subspan( sizeof)` and the second replacement is related to the calculation of the size of the rewritten `std::array`. This happens because the rewriter is trying to apply `.subspan()` to stack_buf, but `stack_buf` is already a `std::array`.

## Solution
The rewriter should avoid calling subspan on a std::array and instead just take the address.
```cpp
  void* stack = stack_buf.data() + sizeof(stack_buf);
```
## Note