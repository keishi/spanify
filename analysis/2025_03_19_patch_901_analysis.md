# Build Failure Analysis: 2025_03_19_patch_901

## First error

../../chrome/browser/extensions/api/proxy/proxy_api_helpers.cc:50:34: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   50 |   return kPACDataUrlPrefix.data().subspan(pac_script_base64_encoded);
      |          ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
The code attempts to call `subspan()` on the result of `kPACDataUrlPrefix.data()`, where `kPACDataUrlPrefix` has been converted to `std::array`.  The `data()` method on `std::array` returns a raw pointer, but the rewriter is generating code as if it returns a `span` object.  Thus the `subspan()` call fails, as raw pointers do not have a `subspan()` method.

## Solution
The rewriter must add `.data()` to any chained calls after calling `data()` when the base type was spanified/arrayified.

```c++
-  return kPACDataUrlPrefix.data().subspan(pac_script_base64_encoded);
+  return kPACDataUrlPrefix.data().data().subspan(pac_script_base64_encoded);