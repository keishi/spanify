# Build Failure Analysis: 2025_03_19_patch_436

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 23303, length 14: "(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))" and offset 23309, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to both replace `sizeof` with the size of a span, and append `.data()` to the same span, but it does not coordinate the replacements correctly. The changes overlap, resulting in the error.

## Solution
The rewriter needs to ensure that the size replacement and the `.data()` addition do not overlap. This likely means checking if a `.data()` is being added to the variable before attempting to replace the `sizeof`.

## Note
The overlapping replacements is occurring at:
```c++
std::string(kCrldp.data(), base::span<const uint8_t>(kCrldp ).subspan( sizeof).data()(kCrldp)));