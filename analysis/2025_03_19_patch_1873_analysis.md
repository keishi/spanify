# Build Failure Analysis: 2025_03_19_patch_1873

## First error

../../chrome/browser/companion/text_finder/text_finder_manager_base_test.cc:73:37: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   73 |       wc.get(), GURL(kBaseUrl.data().subspan(
      |                      ~~~~~~~~~~~~~~~^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter generated `.data()` and `.subspan()` replacements, but placed them in the wrong place.
kBaseUrl was changed to a `std::array`, and then the rewriter attempted to rewrite the `std::string_view` constructor to pass a span:
```
-     wc.get(), GURL(kBaseUrl + base::NumberToString(web_contents_list_.size())));
+      wc.get(), GURL(kBaseUrl.data().subspan(
+                    base::NumberToString(web_contents_list_.size()))));
```
However, it didn't understand that `kBaseUrl.data()` returns a `char*`, so it's not possible to call `.subspan()` on it.

## Solution
The rewriter should understand that `kBaseUrl.data()` returns a `char*`, so it's not possible to call `.subspan()` on it, and emit a different type of replacement.

## Note
There are no other errors.