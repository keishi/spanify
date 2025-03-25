# Build Failure Analysis: 2025_03_19_patch_484

## First error

Overlapping replacements: ./crypto/rsa_private_key_unittest.cc at offset 9727, length 27: "(kTestPrivateKeyInfo.size() * sizeof(decltype(kTestPrivateKeyInfo)::value_type))" and offset 9733, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add both the array size calculation and the `.data()` call to the `kTestPrivateKeyInfo` variable within the `input` vector's constructor. The size calculation and the `.data()` access are generating overlapping replacements, likely because the tool first rewrites the array to a `std::array` and then tries to append `.data()` to it. Because the offsets overlap, the rewriter gets confused.

## Solution
The rewriter logic should be modified to avoid these overlapping replacements. This could involve either reordering the replacements to avoid conflicts, or performing both replacements (rewrite size of and append .data()) in a single operation. Or the rewriter should recognize `std::to_array` and not rewrite the size calculation.