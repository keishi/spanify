# Build Failure Analysis: 2025_03_19_patch_1413

## First error
../../chrome/browser/autocomplete/search_provider_unittest.cc:3326:16: error: no matching function for call to 'to_array'
 3326 |   auto cases = std::to_array<Cases>({
      |                ^~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempted to arrayify `matches` inside the `Cases` struct. This caused a compile error because the rewriter also generated a call to `std::to_array` which is only available in C++20. Because there was no check to prevent calling C++20 features before arrayifying the struct, this caused a compile error.

## Solution
Rewriter should only perform arrayification when it won't generate C++20 features in older Chromium builds, or when C++20 features are supported.

## Note
None