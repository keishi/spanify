# Build Failure Analysis: 2025_03_19_patch_459

## First error

../../chrome/renderer/bound_session_credentials/bound_session_request_throttled_in_renderer_manager_unittest.cc:137:15: error: no matching function for call to 'ElementsAreArray'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The original code used a C-style array, which decays to a pointer when passed to a function. The `ElementsAreArray` function in Google Mock likely expects a container with a `.data()` method when passed a pointer. After the rewriter changed the C-style array `kRequestGURLs` to `std::array`, passing `kRequestGURLs` is no longer automatically decaying to pointer, so the rewriter did not insert `.data()` to be passed into `ElementsAreArray`, resulting in an error at the call site.

## Solution
Add `.data()` to the `kRequestGURLs` variable to explicitly decay to a pointer.

Example:
```c++
testing::ElementsAreArray(kRequestGURLs.data())
```

## Note
The error log contains "note: candidate template ignored: could not match 'T[N]' against 'const value_type *' (aka 'const GURL *')" which shows the issue.