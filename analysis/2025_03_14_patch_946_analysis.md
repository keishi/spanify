# Build Failure Analysis: 2025_03_14_patch_946

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/chrome/common/net/x509_certificate_model_unittest.cc at offset 21091, length 14: "(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))" and offset 21097, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to add `.data()` to the `std::array` variable `kCrldp` when passing it to the `std::string` constructor. At the same time, the rewriter also tried to rewrite `sizeof` expression, leading to overlapping replacements.

## Solution
The rewriter should avoid generating overlapping replacements. Need to fix the overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Note
N/A