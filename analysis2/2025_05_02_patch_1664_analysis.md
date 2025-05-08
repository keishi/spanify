# Build Failure Analysis: 2025_05_02_patch_1664

## First error

Overlapping replacements: ./device/bluetooth/floss/floss_adapter_client_unittest.cc at offset 43259, length 18: "(kFakeBytes.size() * sizeof(decltype(kFakeBytes)::value_type))" and offset 43265, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to apply two replacements in overlapping regions of the code.  First, it rewrote `sizeof(kFakeBytes)` to `(kFakeBytes.size() * sizeof(decltype(kFakeBytes)::value_type))`.  Second, it attempted to add `.data()` to `kFakeBytes`. Since these replacements overlap, the rewriter fails.

## Solution
The rewriter needs to avoid applying both transformations at the same location. Since the code needs `.data()`, the `sizeof` transformation can be skipped.

## Note
The rewriter converted `kFakeBytes` to `std::array` and then tried to pass it to a function as a buffer, requiring `.data()`.  It also tried to rewrite `sizeof(kFakeBytes)`.