# Build Failure Analysis: 2025_03_19_patch_230

## First error

../../ui/accessibility/platform/inspect/ax_inspect_utils.cc:20:34: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
`kConstValuePrefix` was converted to a `std::array`. When returning the subspan of the `data()` member, the rewriter failed to rewrite this to include the .data() method.

## Solution
Rewriter needs to correctly apply `.data()` to the `.subspan()` call.

## Note
A second error was caused by the same underlying issue, where implicit conversions to strings are failing.

```
../../ui/accessibility/platform/inspect/ax_inspect_utils.cc:37:17: error: no viable conversion from 'const std::array<char, 8>' to 'std::string' (aka 'basic_string<char>')
   37 |     std::string const_prefix = kConstValuePrefix;
```

The rewriter changed the type of `kConstValuePrefix` from `char[]` to `std::array`, but it is being assigned to a std::string. Therefore there is an implicit conversion from `std::array` to `std::string` that is no longer compiling. To fix this, the rewriter needs to add `.data()` again.
```
-    std::string const_prefix = kConstValuePrefix;
+    std::string const_prefix = kConstValuePrefix.data();