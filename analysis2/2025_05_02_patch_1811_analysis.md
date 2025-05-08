# Build Failure Analysis: 2025_05_02_patch_1811

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 24665, length 12: "(kAIA.size() * sizeof(decltype(kAIA)::value_type))" and offset 24671, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to the `kAIA` variable, which has been converted to a `std::array`. Simultaneously, it's trying to calculate the size of the `kAIA` array using `(kAIA.size() * sizeof(decltype(kAIA)::value_type))`. The `.data()` replacement overlaps with the size calculation replacement.

## Solution
The rewriter should avoid applying `.data()` when the array size is used.

## Note
The rewriter is attempting to modernize the code by converting `const uint8_t kAIA[]` to `std::array`. Also, the code is using `std::string(kAIA.data(), kAIA + sizeof(kAIA))` to construct a string, which is unsafe. The rewriter should convert it to `std::string(kAIA.begin(), kAIA.end())`.