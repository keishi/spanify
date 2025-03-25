# Build Failure Analysis: 2025_03_19_patch_1175

## First error

Overlapping replacements: ./services/device/public/cpp/test/fake_hid_manager.cc at offset 2552, length 21: ").subspan( sizeof(kResult) - 1)" and offset 2554, length 15: "(kResult.size() * sizeof(decltype(kResult)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter generated two overlapping replacements when trying to rewrite the line:

```c++
std::vector<uint8_t> buffer(kResult.data(), base::span<const char>(kResult + (kResult.size() * sizeof(decltype(kResult)::value_type)) - 1.data());
```

The first replacement is likely due to `RewriteArraySizeof`, which attempts to rewrite `sizeof(kResult) - 1` into `kResult.size() * sizeof(decltype(kResult)::value_type))`.
The second replacement is likely due to `AppendDataCall`, which attempts to add `.data()` to a `std::string_view` when passed to a `base::span` constructor. Because both replacements are trying to modify the same region of code, they conflict, causing the "Overlapping replacements" error.

## Solution
The rewriter should be modified to avoid generating overlapping replacements. In this particular case, it might involve ensuring that the `AppendDataCall` transformation is aware of the `RewriteArraySizeof` transformation and avoids adding `.data()` if the size calculation has already been rewritten. Alternatively, the size calculation rewrite can be made more precise, so that the size calculation has the data call.

## Note
The overlapping replacements indicate a bug in the rewriter's logic, where it's not properly handling the interaction between different rewrite rules.