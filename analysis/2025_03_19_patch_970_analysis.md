# Build Failure Analysis: 2025_03_19_patch_970

## First error

../../sandbox/linux/integration_tests/bpf_dsl_seccomp_unittest.cc:335:23: error: invalid operands to binary expression ('std::array<int, 4>' and 'int')
  335 |   BPF_ASSERT(pipe(fds + 2) == 0);
      |                   ~~~ ^ ~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site.
The `pipe` function signature is `int pipe(int fds[2])`. The rewriter converted `int fds[4]` to `std::array<int, 4> fds`, however it failed to rewrite the call `pipe(fds + 2)`. `fds + 2` is a pointer of type `int*` but `pipe` is now expecting `base::span<int>`.

## Solution
The rewriter needs to ensure that when a function parameter is converted to `base::span`, then ALL call sites are updated to pass a `base::span` to the function.

## Note
No other errors were found.