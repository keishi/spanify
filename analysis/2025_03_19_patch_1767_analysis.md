# Build Failure Analysis: 2025_03_19_patch_1767

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:1746:7: error: no matching conversion for functional-style cast from 'const VarInfo *' to 'base::span<const VarInfo, 1>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter converted `SetupProgramForVariables` to take a `base::span` as an argument, but it failed to recognize the raw pointer `&kVertexVarying` being passed as an argument. This results in a compilation error because there is no implicit conversion from `const VarInfo*` to `base::span<const VarInfo, 1>`. It expects `std::array` (in this case) or something that can deduce the size.

## Solution
The rewriter needs to be updated to recognize raw pointers passed into spanified function parameters, particularly when size information is not available. Rewriter should use the `base::span<const VarInfo, 1>(&kVertexVarying, 1)` instead of `base::span<const VarInfo, 1>(&kVertexVarying)`

## Note
There are multiple similar errors in this build log.