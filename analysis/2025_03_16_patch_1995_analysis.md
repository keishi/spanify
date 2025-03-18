# Build Failure Analysis: 2025_03_16_patch_1995

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/filters/chunk_demuxer_unittest.cc at offset 160611, length 19: "(kCuesHeader.size() * sizeof(decltype(kCuesHeader)::value_type))" and offset 160617, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to `kCuesHeader` while simultaneously rewriting `sizeof(kCuesHeader)` to `(kCuesHeader.size() * sizeof(decltype(kCuesHeader)::value_type))`. This results in overlapping replacements.

## Solution
The rewriter needs to avoid overlapping replacements when rewriting array sizes and adding `.data()` calls. The rewriter can choose to either not rewrite `sizeof` or not add `.data()` calls in cases where they would overlap. A better solution is to rewrite the `sizeof` first and then add the `.data()` call.

## Note
The overlapping replacements error is a common problem in the rewriter and needs to be addressed.