# Build Failure Analysis: 2025_03_14_patch_8

## First error

../../chrome/updater/certificate_tag.cc:473:8: error: no matching function for call to 'CBB_finish'

## Category
Rewriter needs to handle spanified `uint8_t*` variable used with third_party openssl `CBB_finish` function.

## Reason
The rewriter transformed `uint8_t* cbb_data = nullptr;` to `base::span<uint8_t> cbb_data = {};`. However, the `CBB_finish` function from third_party openssl expects a `uint8_t**` as an argument, not a `base::span<uint8_t>*`.

## Solution
The rewriter should not change the type of `cbb_data` in this instance. It is being passed to a third_party function that requires a `uint8_t**`, so the original type should be preserved.

## Note
The second error is a consequence of the first. The rewriter can solve both of them at the same time.