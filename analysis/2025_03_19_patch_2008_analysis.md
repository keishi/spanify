# Build Failure Analysis: 2025_03_19_patch_2008

## First error

```
../../chrome/browser/ui/chrome_pages.cc:711:48: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  711 |       chrome::kChromeUIWebAppSettingsURL.data().subspan(app_id));
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~
```

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The rewriter spanified `data()`, but failed to apply the `.subspan()` rewrite to the return value of `data()`. Since it is directly called on a `std::array` of chars, we expect that it will return a `span` and not require `.data()` call.

## Solution
Rewriter needs to properly apply the `.subspan` rewrite to the return value of `data()`. Add logic to the rewriter to support the `.subspan()` rewrite in this context.

```c++
-      chrome::kChromeUIWebAppSettingsURL.data().subspan(app_id));
+      chrome::kChromeUIWebAppSettingsURL.data().subspan(app_id));
```
The goal is to rewrite it into this:
```c++
chrome::kChromeUIWebAppSettingsURL.subspan(app_id));