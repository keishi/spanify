# Build Failure Analysis: 2025_05_02_patch_1810

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 23303, length 14: "(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))" and offset 23309, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` and calculate the size of the array using `(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))` at almost the same location, leading to overlapping replacements. The rewriter first adds the `.data()` method and then tries to calculate the size.

## Solution
The rewriter needs to avoid generating overlapping replacements. Need to rewrite either AppendDataCall or RewriteArraySizeof to take into account each other. In this case, the rewriter should recognize the usage pattern where the size of the array is being multiplied by the sizeof the element and avoid rewriting that pattern if `.data()` has already been added.

## Note
NA