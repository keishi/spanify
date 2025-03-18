# Build Failure Analysis: 2025_03_14_patch_1407

## First error

../../ui/base/accelerators/global_accelerator_listener/global_accelerator_listener_linux.h:61:3: error: non-static data member cannot be constexpr; did you intend to make it static?

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter changed `kSessionTokenPrefix` from a `constexpr char[]` to a `constexpr std::array<char, 10>`. However, `constexpr` is not allowed on member variables unless the member variable is static.

## Solution
The rewriter should only rewrite the code if the constexpr is static. Otherwise it should not rewrite the code.