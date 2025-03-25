```
# Build Failure Analysis: 2025_03_19_patch_211

## First error

../../extensions/renderer/bindings/api_last_error.cc:252:63: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  252 |   add_console_error_.Run(context, kUncheckedErrorPrefix.data().subspan(error));
      |                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The code is attempting to use `.subspan()` on a `char*` but the rewriter has introduced `.data()` before the `.subspan()` call. This is causing a compilation error because `char*` does not have a `subspan()` method. The intended usage of `.subspan()` was on the original `std::array` object.

## Solution
The rewriter needs to ensure that only one of `.data()` or `.subspan()` is added to a variable access expression. It can check if a replacement is already present before adding another. In this case, remove the .data() replacement.

## Note
The rewriter added the following diffs:
```
-constexpr char kUncheckedErrorPrefix[] = "Unchecked runtime.lastError: ";
+constexpr std::array<char, 30> kUncheckedErrorPrefix{
+    "Unchecked runtime.lastError: "};
```
```
-add_console_error_.Run(context, kUncheckedErrorPrefix + error);
+add_console_error_.Run(context, kUncheckedErrorPrefix.data().subspan(error));
```

The goal was to convert the `char kUncheckedErrorPrefix[]` variable into a `std::array`. But the rewriter failed to adjust how it is used, resulting in the build error.