# Build Failure Analysis: 2025_03_14_patch_786

## First error

../../components/gcm_driver/crypto/encryption_header_parsers_unittest.cc:79:27: error: no matching function for call to 'to_array'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to use `std::to_array`, but this function is not available in the current libc++. The error message "no matching function for call to 'to_array'" indicates that the standard library being used does not provide the `std::to_array` function (likely due to using an older C++ standard library). 
This file is not supposed to be rewritten. This patch should not have attempted to make changes to it.

## Solution
The rewriter must avoid spanifying code when that code requires `std::to_array`. The simplest way to fix this is to avoid rewriting any code that is too new for the chromium build.

## Note
This overlaps with Rewriter needs to avoid spanifying functions if it requires spanifying excluded code. in that we are spanifying code that depends on code excluded from the rewriter.