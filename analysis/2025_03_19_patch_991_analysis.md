# Build Failure Analysis: 2025_03_19_patch_991

## First error

../../components/password_manager/core/browser/password_ui_utils.cc:52:35: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a `char[]` to `std::array`, but the arrayified variable is used with `.subspan()`.

```
-constexpr char kPlayStoreAppPrefix[] =
-    "https://play.google.com/store/apps/details?id=";
+constexpr std::array<char, 47> kPlayStoreAppPrefix{
+    "https://play.google.com/store/apps/details?id="};

...

-    return GURL(kPlayStoreAppPrefix + facet_uri.android_package_name());
+    return GURL(
+        kPlayStoreAppPrefix.data().subspan(facet_uri.android_package_name()));
```

This results in the following error:

```
../../components/password_manager/core/browser/password_ui_utils.cc:52:35: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   52 |         kPlayStoreAppPrefix.data().subspan(facet_uri.android_package_name()));
```

## Solution
Rewrite

```
kPlayStoreAppPrefix.data().subspan(facet_uri.android_package_name())
```

to

```
kPlayStoreAppPrefix.data()
```

The rewriter needs to add `.data()` when arrayified `char[]` variable is passed to `base::GURL`.

## Note
No other errors found.