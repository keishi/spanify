# Build Failure Analysis: 2025_03_19_patch_1816

## First error

../../gpu/command_buffer/service/program_manager_unittest.cc:292:29: error: no viable conversion from 'AttribInfo[]' (aka 'gpu::gles2::TestHelper::AttribInfo[]') to 'base::span<AttribInfo>' (aka 'span<gpu::gles2::TestHelper::AttribInfo>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The `SetupShaderExpectations` function now expects a `base::span<AttribInfo>` as its first argument, but it is being called with a C-style array `kAttribs`. The implicit conversion from a C-style array to `base::span` is not happening in this case. This is because the rewriter failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to handle the case where C-style arrays are passed to a spanified function. It needs to either convert the C-style array into a span at the call site or spanify the function so it accepts C style array.

```c++
// Add .data() to kAttribs when it is passed into the SetupShaderExpectations
SetupShaderExpectations(base::span<AttribInfo>(kAttribs, kNumAttribs), kNumAttribs, kUniforms, kNumUniforms,
```

## Note
The following errors were also reported:
1. "use of undeclared identifier 'kAttrib1Name'" This indicates that the code is accessing static members of the `ProgramManagerWithShaderTest` class without scope resolution. These accesses need to be updated to `ProgramManagerWithShaderTest::kAttrib1Name`, and so on.
2. "'AttribInfo' is a protected member of 'gpu::gles2::ProgramManagerWithShaderTest'" Since the `AttribInfo` is a protected member, the `std::to_array` cannot access it. This means that it needs to be defined outside the class.