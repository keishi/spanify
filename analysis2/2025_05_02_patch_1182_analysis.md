# Build Failure Analysis: 2025_05_02_patch_1182

## First error

Conflicting replacement text: ./media/base/container_names_unittest.cc at offset 906, length 14: "(kRm2Buffer.size() * sizeof(decltype(kRm2Buffer)::value_type))" != "(kWtvBuffer.size() * sizeof(decltype(kWtvBuffer)::value_type))"

## Category
Overlapping replacements in macro.

## Reason
The error message "Conflicting replacement text" indicates that the rewriter is attempting to apply multiple, different replacements to the same region of code. In this case, the conflicting replacements occur at the same offset (906) and have the same length (14) in `media/base/container_names_unittest.cc`. This happens because the rewriter is attempting to rewrite `sizeof` expressions inside a macro that is used with different buffers. This causes the tool to generate multiple replacements for the same region using different buffer names, which leads to the conflict.

## Solution
The rewriter should detect when it's operating within a macro and avoid generating replacements that rewrite code inside it, or handle them more carefully to ensure that all uses of the macro are updated consistently. One approach is to skip rewriting code inside macros entirely.

## Note
The `VERIFY` macro is defined as:
```
#define VERIFY(buffer, name)                                                   \
  EXPECT_EQ(name, DetermineContainer(reinterpret_cast<const uint8_t*>(buffer), \
                                     sizeof(buffer)))
```

The rewriter rewrites `sizeof(buffer)` to `(buffer.size() * sizeof(decltype(buffer)::value_type))`. In the test, this macro is used with different buffers, such as `kRm2Buffer` and `kWtvBuffer`.
```
VERIFY(kRm2Buffer, MediaContainerName::kContainerRM);
VERIFY(kWtvBuffer, MediaContainerName::kContainerWTV);
```
Thus there are conflicting replacements at offset 906 with different buffer names:
```
"(kRm2Buffer.size() * sizeof(decltype(kRm2Buffer)::value_type))" != "(kWtvBuffer.size() * sizeof(decltype(kWtvBuffer)::value_type))"