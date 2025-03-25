# Build Failure Analysis: 2025_03_19_patch_1406

## First error

../../chrome/browser/apps/platform_apps/platform_app_launch.cc:152:61: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  152 |         chrome::kChromeUIAppsWithDeprecationDialogURL.data().subspan(app_id));
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter successfully converted `kChromeUIAppsWithDeprecationDialogURL` to a `std::array<char, 34>`, and added `.data()` to access the underlying `char*`. However, it failed to apply `.subspan()` to that return value, leading to the error message `member reference base type 'const value_type *' (aka 'const char *') is not a structure or union`. The generated code `kChromeUIAppsWithDeprecationDialogURL.data().subspan(app_id))` is invalid because `.subspan()` should be called on `kChromeUIAppsWithDeprecationDialogURL.data()`.

## Solution
The rewriter needs to apply subspan rewrite to a spanified return value. Apply `()` to `kChromeUIAppsWithDeprecationDialogURL.data()` before calling `subspan`.

## Note
None