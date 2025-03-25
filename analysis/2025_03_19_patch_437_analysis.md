# Build Failure Analysis: 2025_03_19_patch_437

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 24665, length 12: "(kAIA.size() * sizeof(decltype(kAIA)::value_type))" and offset 24671, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite both the size calculation and add `.data()` to the `kAIA` variable, which is now a `std::array`. However, the size calculation `(kAIA.size() * sizeof(decltype(kAIA)::value_type))` and the `.data()` call `.data()` are overlapping each other causing a conflict.

## Solution
The rewriter should avoid trying to calculate the size when it is adding .data() to a std::array.

## Note
N/A