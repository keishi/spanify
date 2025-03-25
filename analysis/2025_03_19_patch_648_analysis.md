# Build Failure Analysis: 2025_03_19_patch_648

## First error

../../net/base/hash_value.h:34:25: error: member reference base type 'const unsigned char[32]' is not a structure or union
  34 |   return memcmp(lhs.data.data(), rhs.data.data(),

## Category
Rewriter failed to add .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `lhs.data` and `rhs.data` even though these members were not spanified. This is because the rewriter attempts to spanify HashValue::data which is now a base::span. But the code assumes that `fingerprint.sha256.data` (which is assigned to `HashValue::fingerprint.sha256.data`) was spanified, and thus it requires `.data()`. But `fingerprint.sha256.data` is not spanified. Therefore we end up with `fingerprint.sha256.data.data()` which is incorrect.

## Solution
The rewriter should not be adding `.data()` to `lhs.data` or `rhs.data` as HashValue::data is already a base::span.

## Note
Multiple other errors exist in the build log that have to do with applying `.data()` to variables that are already spans or std::arrays.