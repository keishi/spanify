# Build Failure Analysis: 2025_05_02_patch_919

## First error

../../services/tracing/perfetto/privacy_filtering_check.cc:89:17: error: no matching function for call to 'FindIndexOfValue'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `FindIndexOfValue` was spanified, but the call site passes `root->accepted_field_ids` which resolves to a raw pointer, rather than a `base::span`.  The rewriter didn't recognize that `root->accepted_field_ids` is an array, and therefore failed to generate the code to construct a span from it.

## Solution
The rewriter needs to recognize that `root->accepted_field_ids` is a pointer to the start of an array for which size information is available, and generate code to create a `base::span` from it.  This would likely involve either constructing the span inline at the callsite, or creating a temporary span variable.
```c++
int FindIndexOfValue(base::span<const int> arr, uint32_t value) { ... }

// Incorrect:
int index = FindIndexOfValue(root->accepted_field_ids, f.id());

// Correct:
int index = FindIndexOfValue(base::span(root->accepted_field_ids, kSomeSize), f.id());
```

## Note
The error message is:
```
../../services/tracing/perfetto/privacy_filtering_check.cc:89:17: error: no matching function for call to 'FindIndexOfValue'
   89 |     int index = FindIndexOfValue(root->accepted_field_ids, f.id());
      |                 ^~~~~~~~~~~~~~~~
../../services/tracing/perfetto/privacy_filtering_check.cc:39:5: note: candidate function not viable: no known conversion from 'const int *const' to 'const base::span<const int>' for 1st argument
   39 | int FindIndexOfValue(const base::span<const int> arr, uint32_t value) {
      |     ^                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~