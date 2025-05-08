```
# Build Failure Analysis: 2025_05_02_patch_1018

## First error

```
Overlapping replacements: ./media/audio/audio_opus_encoder.cc at offset 5761, length 26: "(kExtraDataTemplate.size() * sizeof(decltype(kExtraDataTemplate)::value_type))" and offset 5767, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements that overlap each other. One replacement is for rewriting `sizeof(kExtraDataTemplate)` to `(kExtraDataTemplate.size() * sizeof(decltype(kExtraDataTemplate)::value_type))`. The second replacement is to add `.data()` to `kExtraDataTemplate` when calling `base::span<const uint8_t>(kExtraDataTemplate )`.

The overlap occurs because the `RewriteArraySizeof` replacement includes part of the expression that the `AppendDataCall` replacement is targeting.

## Solution
The rewriter should avoid overlapping replacements. It could do this by ensuring that the ranges of replacements are mutually exclusive. The logic in `Spanifier.cpp` needs to be adjusted to avoid generating replacements when overlap other replacements. It also looks like the rewriter inserted `sizeof` in the subspan function parameters by mistake, so it must also be avoided.

## Note
This type of overlapping replacement can be avoided by running the replacements in order of file offset.