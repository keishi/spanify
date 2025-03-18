# Build Failure Analysis: 2025_03_16_patch_131

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/audio/audio_opus_encoder.cc at offset 5761, length 26: "(kExtraDataTemplate.size() * sizeof(decltype(kExtraDataTemplate)::value_type))" and offset 5767, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to replace `sizeof(kExtraDataTemplate)` with `(kExtraDataTemplate.size() * sizeof(decltype(kExtraDataTemplate)::value_type))` but also tried to add `.data()` resulting in overlapping replacements and invalid C++ syntax. The code transformation logic introduced overlapping replacements. First `sizeof(kExtraDataTemplate)` is replaced with  `(kExtraDataTemplate.size() * sizeof(decltype(kExtraDataTemplate)::value_type))`, and then the rewriter attempts to insert `.data()` at the same location `kExtraDataTemplate`.  This happens because the replacements are done in separate passes that are unaware of each other.

## Solution
The rewriter should be modified to avoid overlapping replacements by either:
1. Combining the transformations into a single pass, or
2. Ensuring that subsequent passes account for changes made by previous passes.

In this specific case, the `AppendDataCall` rewriter pass should check if the variable is of `std::array` and the `RewriteArraySizeof` is operating on that variable, then skip the replacement to add `.data()` at the variable name.

## Note
The build log shows only one error, so there are no secondary errors to report.