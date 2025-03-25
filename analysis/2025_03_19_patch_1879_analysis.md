# Build Failure Analysis: 2025_03_19_patch_1879

## First error
../../crypto/sha2_unittest.cc:89:3: error: no matching function for call to 'SHA256HashString'

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `uint8_t output2[crypto::kSHA256Length];` to `std::array<uint8_t, crypto::kSHA256Length> output2;`. However, the third-party function `crypto::SHA256HashString` expects a `void*` as the second argument, not a `std::array`.  The rewriter needs to add `.data()` to `output2` when it is passed to `crypto::SHA256HashString`.

## Solution
The rewriter should add `.data()` to `output2` when it is passed to `crypto::SHA256HashString`. This will convert the `std::array` to a pointer, which is what the function expects.

## Note
The build log shows that the compiler is unable to find a matching function for the call to `crypto::SHA256HashString`.  The error message indicates that there is no known conversion from `std::array<uint8_t, crypto::kSHA256Length>` to `void *`. This confirms that the rewriter failed to add `.data()` to the `std::array` variable.