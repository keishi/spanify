# Build Failure Analysis: 2025_05_02_patch_1364

## First error

../../base/process/launch_posix.cc:764:17: error: invalid operands to binary expression ('std::array<char, (__builtin_constant_p(16384) ? 16384 : 16384)>' and 'unsigned long')
  764 |       stack_buf + (stack_buf.size() * sizeof(decltype(stack_buf)::value_type)));
      |       ~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/compiler_specific.h:1060:41: note: expanded from macro 'UNSAFE_TODO'
 1060 | #define UNSAFE_TODO(...) UNSAFE_BUFFERS(__VA_ARGS__)
      |                                         ^~~~~~~~~~~
../../base/compiler_specific.h:1042:3: note: expanded from macro 'UNSAFE_BUFFERS'
 1042 |   __VA_ARGS__                                \
      |   ^~~~~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code is attempting to perform pointer arithmetic on `stack_buf`, which is now a `std::array`.  The correct way to get a pointer to an offset within the array is to use `.data() + offset`. Since `UNSAFE_TODO` expands to the expression itself this means that the rewriter failed to rewrite this pattern. The expression after the `+` is of type `unsigned long`, but it expects a `char*`, so the rewriter should add `.data()` to `stack_buf`.

## Solution
The rewriter needs to rewrite expressions that perform pointer arithmetic on `std::array` instances to use `.data() + offset`. In this case, the rewriter should have rewritten the line to:

```c++
void* stack = UNSAFE_TODO(
      stack_buf.data() + (stack_buf.size() * sizeof(decltype(stack_buf)::value_type)));
```

## Note
The `UNSAFE_TODO` macro is just an identity macro.