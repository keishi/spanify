# Build Failure Analysis: 2025_03_19_patch_435

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 21118, length 14: "(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))" and offset 21124, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first tries to generate code to compute the size of the array, and then tries to add `.data()` to the spanified variable. Because the ranges overlap, the rewriter fails.

## Solution
The rewriter needs to avoid generating code with overlapping replacements. It needs to be smarter about the order in which it applies replacements.

## Note
N/A