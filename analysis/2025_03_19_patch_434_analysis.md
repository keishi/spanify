# Build Failure Analysis: 2025_03_19_patch_434

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 13956, length 18: "(kExtension.size() * sizeof(decltype(kExtension)::value_type))" and offset 13962, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite the `sizeof` expression and add a `.data()` call at the same location, resulting in overlapping replacements. This occurs because both `RewriteArraySizeof` and `AppendDataCall` are trying to modify the same part of the code.

## Solution
The rewriter should be modified to avoid overlapping replacements when both rewriting `sizeof` and adding `.data()` are necessary. One possible solution would be to ensure the `AppendDataCall` happens *after* the `RewriteArraySizeof` replacement, taking the offset into account. The ranges of these rewrites should not conflict. This might require adjustments to the ordering or logic of the rewriter passes.

## Note
The rewriter is also making a subspan call without a .data() on kExtension, which will probably cause another compiler error.