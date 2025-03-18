# Build Failure Analysis: 2025_03_14_patch_152

## First error

../../chrome/browser/ui/webui/settings/site_settings_handler.cc:602:9: error: no matching function for call to 'StartsWith'

## Category
Rewriter needs to add `.data()` to arrayified `char[]` variable used with `base::StartsWith`.

## Reason
The code was changed to use `std::array<char, 8> kGroupingKeyOriginPrefix` instead of `constexpr char kGroupingKeyOriginPrefix[] = "origin:"`. The `base::StartsWith` function expects a `std::string_view` or `std::u16string_view` as its arguments, but the array variable does not convert to `string_view` implicitly. The rewriter should add `.data()` to allow compilation.

## Solution
The rewriter should add `.data()` to `kGroupingKeyOriginPrefix` when calling `base::StartsWith`.

```diff
--- a/chrome/browser/ui/webui/settings/site_settings_handler.cc
+++ b/chrome/browser/ui/webui/settings/site_settings_handler.cc
@@ -599,7 +599,7 @@
         serialized.substr(sizeof(kGroupingKeyEtldPrefix) - 1));
   }
   CHECK(base::StartsWith(serialized, kGroupingKeyOriginPrefix));
-  GURL url(serialized.substr(sizeof(kGroupingKeyOriginPrefix) - 1));
+  GURL url(serialized.substr(sizeof(kGroupingKeyOriginPrefix) - 1));
   return GroupingKey::Create(url::Origin::Create(url));
 }

```

should be changed to:

```diff
--- a/chrome/browser/ui/webui/settings/site_settings_handler.cc
+++ b/chrome/browser/ui/webui/settings/site_settings_handler.cc
@@ -599,7 +599,7 @@
         serialized.substr(sizeof(kGroupingKeyEtldPrefix) - 1));
   }
   CHECK(base::StartsWith(serialized, kGroupingKeyOriginPrefix.data()));
+  GURL url(serialized.substr(sizeof(kGroupingKeyOriginPrefix) - 1));
   return GroupingKey::Create(url::Origin::Create(url));
 }
```

## Note
The other error is related to this one:
```
../../chrome/browser/ui/webui/settings/site_settings_handler.cc:618:42: error: invalid operands to binary expression ('const std::array<char, 8>' and 'const char *')
  618 |                                         return kGroupingKeyOriginPrefix +
```
The rewriter will probably fix it once the first error is fixed as well.