# Build Failure Analysis: 2025_03_19_patch_1176

## First error

Overlapping replacements: ./services/device/public/cpp/test/fake_hid_manager.cc at offset 4029, length 21: ").subspan( sizeof(kResult) - 1)" and offset 4031, length 15: "(kResult.size() * sizeof(decltype(kResult)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements to the same region of code, leading to overlapping modifications.  One replacement is likely related to rewriting `sizeof(kResult) - 1`, and the other is trying to rewrite `kResult.size() * sizeof(decltype(kResult)::value_type)`. The presence of `AppendDataCall` in the description suggests the addition of `.data()`, is needed when converting a C-style array to std::array in a third_party function call. It looks like `kResult` was converted to a std::string_view.

## Solution
The rewriter needs to avoid generating overlapping replacements.  This may involve better coordination between different rewriting passes or more precise logic for determining the boundaries of code regions to be rewritten. Likely the rewriter is generating one replacement assuming kResult is a `char[]`, and then another assuming kResult is a `std::string_view`.

## Note
The rewriter converted `const char kResult[]` to `const std::string_view kResult`.