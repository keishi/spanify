# Build Failure Analysis: 2025_03_19_patch_485

## First error

Conflicting replacement text: ./crypto/rsa_private_key_unittest.cc at offset 8112, length 29: "(kTestEcPrivateKeyInfo.size() * sizeof(decltype(kTestEcPrivateKeyInfo)::value_type))" and offset 8118, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to insert `.data()` while also trying to rewrite `sizeof()` operation on the same variable. This results in overlapping replacements and a build failure.

## Solution
The rewriter should be updated to avoid overlapping replacements when rewriting `sizeof` operations and adding `.data()` calls. This might involve prioritizing one replacement over the other or adjusting the replacement ranges to avoid conflicts. More sophisticated conflict resolution logic needs to be added to the rewriter.

## Note
The rewriter should be modified to handle this particular case of rewriting `sizeof()` calls while converting a C-style array to `std::array`.