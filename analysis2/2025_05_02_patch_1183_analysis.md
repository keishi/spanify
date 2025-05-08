# Build Failure Analysis: 2025_05_02_patch_1183

## First error

../../extensions/common/user_script.cc:46:5: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char *const'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kManifestContentScriptPrefix` to `std::string_view`, but it is being used in a context that expects `const char*`. The fix is to add `.data()` to the variable.

## Solution
The rewriter should add `.data()` when a `std::string_view` variable is being passed to a function that expects `const char*`.
```diff
-  return kManifestContentScriptPrefix +
+  return kManifestContentScriptPrefix.data() +
```

## Note
None