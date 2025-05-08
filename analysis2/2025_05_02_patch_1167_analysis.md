# Build Failure Analysis: 2025_05_02_patch_1167

## First error

../../third_party/blink/renderer/modules/xr/xr_session.cc:838:44: error: invalid operands to binary expression ('const std::string_view' (aka 'const basic_string_view<char>') and 'String')
  838 |         kFeatureNotSupportedByDevicePrefix +
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^
  839 |             XRSessionFeatureToString(device::mojom::XRSessionFeature::ANCHORS));

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to concatenate a `std::string_view` (kFeatureNotSupportedByDevicePrefix) with a `String` (result of XRSessionFeatureToString).  However, the `String` class does not have an `operator+` overload that accepts a `std::string_view`. The `kFeatureNotSupportedByDevicePrefix` was rewritten to `std::string_view` but the rewriter didn't account for its usage with `String`'s `operator+`.

## Solution
The rewriter needs to add `.data()` to the `kFeatureNotSupportedByDevicePrefix` to convert it back to a C-style string when it's being used in conjunction with `String` to concatenate a string.

## Note
There is another similar error on line 981 and 1081.