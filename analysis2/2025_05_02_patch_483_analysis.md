# Build Failure Analysis: 2025_05_02_patch_483

## First error
../../services/device/geolocation/wifi_data_provider_linux.cc:267:41: error: no matching function for call to 'MacAddressAsString'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `MacAddressAsString` was spanified to take a `base::span<const uint8_t, 6>`. The code in `wifi_data_provider_linux.cc` calls this function with a `std::vector<uint8_t> mac_bytes`. The rewriter is not automatically converting the std::vector to a span.

## Solution
The rewriter should insert `base::span(mac_bytes.data(), mac_bytes.size())` to convert `std::vector<uint8_t>` to `base::span<const uint8_t, 6>`.

The solution is that the rewriter needs to be able to recognize that this vector needs to be converted to a span to pass into a function.

## Note
None