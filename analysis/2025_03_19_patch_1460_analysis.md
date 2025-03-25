# Build Failure Analysis: 2025_03_19_patch_1460

## First error
Overlapping replacements: ./media/audio/audio_opus_encoder.cc at offset 5761, length 26: "(kExtraDataTemplate.size() * sizeof(decltype(kExtraDataTemplate)::value_type))" and offset 5767, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to generate the `buffer.size() * sizeof(decltype(buffer)::value_type))` and `.data()` replacements next to each other for a `std::array` type. The `RewriteArraySizeof` and `AppendDataCall` rewrites are generating overlapping replacements due to a bug in the rewriter.

## Solution
Ensure the rewriter can handle the combination of `RewriteArraySizeof` and `AppendDataCall` rewrites without generating overlapping replacements.

## Note
There was one error.