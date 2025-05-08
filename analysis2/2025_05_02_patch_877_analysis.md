# Build Failure Analysis: 2025_05_02_patch_877

## First error
../../gpu/command_buffer/service/program_manager_unittest.cc:538:9: error: use of undeclared identifier 'kUniform1Name'; did you mean 'ProgramManagerWithShaderTest::kUniform1Name'?

## Category
Rewriter needs to qualify names within std::to_array initializer list.

## Reason
The rewriter converted a C-style array to `std::to_array`. However, the identifiers used to initialize the `std::to_array` were class members and were not qualified with the class name. Because the code is now inside the `std::to_array` initializer list, the compiler cannot find the identifiers because they are not in the same scope anymore.

## Solution
The rewriter needs to qualify all the identifiers in the `std::to_array` initializer list with the class name.

```c++
// Original code:
auto kUniforms = std::to_array<ProgramManagerWithShaderTest::UniformInfo>({
    {
        kUniform1Name,
        kUniform1Size,
        kUniform1Type,
        kUniform1FakeLocation,
        kUniform1RealLocation,
        kUniform1DesiredLocation,
        kUniform1Name,
    },
});

// Rewritten code:
auto kUniforms = std::to_array<ProgramManagerWithShaderTest::UniformInfo>({
    {
        ProgramManagerWithShaderTest::kUniform1Name,
        ProgramManagerWithShaderTest::kUniform1Size,
        ProgramManagerWithShaderTest::kUniform1Type,
        ProgramManagerWithShaderTest::kUniform1FakeLocation,
        ProgramManagerWithShaderTest::kUniform1RealLocation,
        ProgramManagerWithShaderTest::kUniform1DesiredLocation,
        ProgramManagerWithShaderTest::kUniform1Name,
    },
});
```

## Note
All the identifiers need to be qualified.