# Build Failure Analysis: 2025_05_02_patch_711

## First error

../../base/profiler/stack_copier_signal_unittest.cc:121:22: error: cannot cast from type 'std::array<uint32_t, std::size(kStackSentinels)>' (aka 'array<unsigned int, std::size(kStackSentinels)>') to pointer type 'void *'
  121 |   base::debug::Alias((void*)sentinels);  // Defeat compiler optimizations.
      |                      ^~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a C-style array `uint32_t sentinels[std::size(kStackSentinels)]` to `std::array<uint32_t, std::size(kStackSentinels)> sentinels;`. The spanified variable `sentinels` is then cast to `void*` and passed to `base::debug::Alias`. Because `sentinels` is now a `std::array`, it no longer automatically decays to a pointer. To fix this, `.data()` needs to be added to `sentinels` to get a pointer to the underlying array.

## Solution
The rewriter should recognize this pattern and add `.data()` when a `std::array` is cast to a pointer type.

```c++
// Original code:
base::debug::Alias((void*)sentinels);

// Rewritten code:
base::debug::Alias((void*)sentinels.data());