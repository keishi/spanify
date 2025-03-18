# Build Failure Analysis: 2025_03_14_patch_1452

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:292:29: error: no viable conversion from 'AttribInfo[]' (aka 'gpu::gles2::TestHelper::AttribInfo[]') to 'base::span<AttribInfo>' (aka 'span<gpu::gles2::TestHelper::AttribInfo>')

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The `SetupShaderExpectations` function in `GLES2DecoderTestBase` was modified to take a `base::span<AttribInfo>` as an argument. However, the call site in `ProgramManagerWithShaderTest::SetupShader` was passing a C-style array `kAttribs`. The compiler couldn't implicitly convert the C-style array to a `base::span`.

## Solution
The rewriter needs to generate correct code to handle C-style arrays when a function is spanified, but it does not do so in the current implementation. There are two options:

1. Change the array to a `std::array`. This resolves the immediate compilation failure. The rewriter would need to detect C-style array and replace it with std::array.
2. Add `.data()` and the size to the callsite.  This is only possible if the size is available at the callsite as a constant.

In the case of `kAttribs` a better solution is to use `std::array` since this is a unittest.

```c++
// Replace
ProgramManagerWithShaderTest::AttribInfo
    ProgramManagerWithShaderTest::kAttribs[] = { ... }

// With

auto kAttribs = std::to_array<ProgramManagerWithShaderTest::AttribInfo>({ ... });
```

## Note

The remaining errors are related to the same root cause: the mismatch between the C-style array `kAttribs` and the `base::span<AttribInfo>` parameter in the `SetupShaderExpectations` function. After fixing the first error, the rest of the errors should be resolved.