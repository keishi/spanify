# Build Failure Analysis: 2025_05_02_patch_1808

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 21118, length 14: "(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))" and offset 21124, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements in the same region of the code. One replacement adds `.data()` and the other replaces `sizeof(kCrldp)` with `(kCrldp.size() * sizeof(decltype(kCrldp)::value_type))`. Because the `.data()` is being added *inside* the region that is to be replaced by the `sizeof` replacement, the replacements overlap, causing an error.

## Solution
The rewriter needs to avoid overlapping replacements when applying both the RewriteArraySizeof and AppendDataCall transformations. The rewriter needs to determine the full expression that needs to be replaced *before* applying any individual replacements. The replacements must be applied in an order that avoids conflicts or combined into a single replacement. In this case, the rewriter should likely prevent RewriteArraySizeof from running when the variable is used with `.data()`.

## Note