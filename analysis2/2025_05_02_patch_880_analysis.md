# Build Failure Analysis: 2025_05_02_patch_880

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1538:18: error: no matching function for call to 'to_array'
 1538 |   auto kParams = std::to_array<const GLint*>({

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The code attempts to use `std::to_array` to create a `std::array` from an initializer list. The error message indicates that the compiler cannot find a suitable `std::to_array` function for the provided initializer list type (`const array<int, 2UL>`).

This likely happened because a function was spanified and this resulted in needing to use `std::to_array` in code that cannot be rewritten. Since the `std::to_array` call cannot be automatically fixed, the rewriter should not have spanified the function in the first place.

## Solution
The rewriter should avoid spanifying functions that require rewriting excluded code.

## Note
The compile error indicates that the `std::to_array` call does not match any of the available overloads.