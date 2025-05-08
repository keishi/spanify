# Build Failure Analysis: 2025_05_02_patch_578

## First error
Overlapping replacements: ./crypto/rsa_private_key_unittest.cc at offset 8112, length 29: "(kTestEcPrivateKeyInfo.size() * sizeof(decltype(kTestEcPrivateKeyInfo)::value_type)))" and offset 8118, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first rewrites `sizeof(kTestEcPrivateKeyInfo)` to `(kTestEcPrivateKeyInfo.size() * sizeof(decltype(kTestEcPrivateKeyInfo)::value_type)))`. It then attempts to add `.data()` to `kTestEcPrivateKeyInfo`. Since these replacements overlap, the rewriter aborts.

## Solution
The rewriter should avoid adding `.data()` in cases where the size of the array is being computed using `sizeof`.

## Note