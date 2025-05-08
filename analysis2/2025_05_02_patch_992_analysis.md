# Build Failure Analysis: 2025_05_02_patch_992

## First error

Overlapping replacements: ./services/device/public/cpp/test/fake_hid_manager.cc at offset 4029, length 21: ").subspan( sizeof(kResult) - 1)" and offset 4031, length 15: "(kResult.size() * sizeof(decltype(kResult)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements at overlapping locations in the code. The first replacement intends to insert `.data()` following `kResult`. The second replacement is designed to calculate the size of the `kResult` buffer using `(kResult.size() * sizeof(decltype(kResult)::value_type))`. Both transformations target overlapping segments of the code, causing a conflict.

## Solution
The rewriter should not try to rewrite `sizeof()` of a string literal which is already a `std::string_view`.
The proper size of a string view is always `string_view.size()`.
```cpp
   buffer.insert(buffer.end(), kResult.data(), kResult.data() + kResult.size());
```

## Note
None