# Build Failure Analysis: 2025_03_19_patch_1802

## First error

../../chrome/browser/ui/webui/settings/site_settings_handler.cc:602:9: error: no matching function for call to 'StartsWith'
  602 |   CHECK(base::StartsWith(serialized, kGroupingKeyOriginPrefix));
      |         ^~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter replaced `char[]` with `std::array` named `kGroupingKeyOriginPrefix` in `site_settings_handler.cc`. However `base::StartsWith` was not updated to use `.data()`.

## Solution
When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a third_party function call.

## Note
The third_party code in question here is base::StartsWith which is chromium code.