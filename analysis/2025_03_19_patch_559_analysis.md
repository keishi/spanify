# Build Failure Analysis: 2025_03_19_patch_559

## First error

Overlapping replacements: ./chrome/browser/image_decoder/image_decoder_browsertest.cc at offset 3016, length 22: ").subspan( sizeof(kJpgData) - 1)" and offset 3018, length 16: "(kJpgData.size() * sizeof(decltype(kJpgData)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements that overlap:
1. Replacing `sizeof(kJpgData) - 1` with `(kJpgData.size() * sizeof(decltype(kJpgData)::value_type))`
2. Replacing `kJpgData` with `base::span<const char>(kJpgData +` and adding `.data()`

The overlapping replacements cause the build to fail. The first replacement generates a call to size(), which is invalid if the variable is a C-style array (which it was originally). The addition of .data() to the array makes the call to size() valid and the overlapping replacement then generates the call to size() * sizeof(). 

## Solution
The rewriter needs to avoid generating overlapping replacements. It should first determine if the variable is a C-style array or a `std::array` before generating the replacements.

## Note
The rewriter also spanified the variable name inside .data(), which is incorrect. It should have just added .data() and not converted the underlying variable to a span at the same time.