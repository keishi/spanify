# Build Failure Analysis: 2025_05_02_patch_577

## First error
Overlapping replacements: ./crypto/rsa_private_key_unittest.cc at offset 9727, length 27: "(kTestPrivateKeyInfo.size() * sizeof(decltype(kTestPrivateKeyInfo)::value_type))" and offset 9733, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to apply two conflicting replacements at nearly the same location. First, it tried to rewrite `sizeof(kTestPrivateKeyInfo)` to `(kTestPrivateKeyInfo.size() * sizeof(decltype(kTestPrivateKeyInfo)::value_type))`. Then, in a subsequent step, it tried to add `.data()` to the spanified variable `kTestPrivateKeyInfo`. Because the `.data()` insertion point falls within the range of the `sizeof` rewrite, the replacements conflict.

## Solution
The rewriter logic needs to be adjusted to avoid these overlapping replacements. When dealing with `std::to_array`, the rewriter should either:

1.  Add the `.data()` call *before* rewriting `sizeof`.
2.  Recognize the `sizeof` pattern and incorporate it into the `.data()` addition logic, producing the correct code in a single replacement step.

## Note
There are 3 overlapping replacements.