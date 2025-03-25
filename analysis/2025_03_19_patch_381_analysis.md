# Build Failure Analysis: 2025_03_19_patch_381

## First error

../../base/check_op.h:229:26: error: invalid operands to binary expression ('const char *const' and 'const std::array<char, 8>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `std::string_view`.

## Reason
The rewriter converted a C-style `char[]` array to `std::array<char, N>`. The code uses `DCHECK_EQ` to compare `histogram_data->name` (which is now `std::array<char, 8>`) with a `const char *const`. The `CheckOpValueStr` macro, used by `DCHECK_EQ`, doesn't have an overload to handle `std::array<char, 8>`. Adding `.data()` to `histogram_data->name` will convert `std::array` to `char*`, allowing the comparison to proceed correctly.

## Solution
The rewriter should add `.data()` to the `std::array<char, N>` variable in the `DCHECK_EQ` call.

```diff
--- a/base/metrics/persistent_histogram_allocator.cc
+++ b/base/metrics/persistent_histogram_allocator.cc
@@ -582,7 +582,7 @@
   // statement here and serves as a double-check that everything is
   // correct before commiting the new histogram to persistent space.
   DurableStringView durable_name(
-      std::string_view(histogram_data->name, name.size()));
+      std::string_view(histogram_data->name.data(), name.size()));
   std::unique_ptr<HistogramBase> histogram =
       CreateHistogram(histogram_data, durable_name);
   DCHECK(histogram);
```

## Note

A secondary error occurs because the code was passing the `std::array` object directly to the `std::string_view` constructor rather than using `.data()` to get a `char*`. Adding `.data()` will fix both errors.