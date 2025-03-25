# Build Failure Analysis: 2025_03_19_patch_762

## First error

Overlapping replacements: ./components/services/filesystem/directory_impl_unittest.cc at offset 10085, length 15: ".subspan( strlen(kData))" and offset 10099, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to the spanified variable `kData` in `strlen(kData)`, and also attempts to rewrite `strlen(kData)` to use `.subspan` instead of the C-style array. This results in overlapping replacements.

## Solution
The rewriter should avoid generating overlapping replacements. One way to resolve this is to ensure that RewriteArraySizeof runs before AppendDataCall.

## Note
This error appears multiple times in the build log.