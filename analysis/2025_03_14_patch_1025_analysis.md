# Build Failure Analysis: 15

## First error

../../components/search_engines/enterprise/site_search_policy_handler_unittest.cc:717:41: error: no viable conversion from 'policy::(anonymous namespace)::TestProvider *' to 'base::span<policy::TestProvider>'

## Category
Rewriter needs to create a span from a C-style array.

## Reason
The rewriter attempts to create a `base::span` from a C-style array `kInvalidUrlTestProviders` using `std::begin` and `std::end`. However, the resulting iterator type `policy::(anonymous namespace)::TestProvider *` is not implicitly convertible to the `base::span<policy::TestProvider>` type.  It is also attempting to increment a `base::span` in the loop's post-statement, which is also incorrect.

## Solution
Use `base::make_span` to create the `base::span` from the C-style array. Rewrite the loop to use an index, since it doesn't seem like range-based for loop will correctly resolve the span.

```c++
-  for (base::span<policy::TestProvider> it =
-           std::begin(kInvalidUrlTestProviders);
-       it != std::end(kInvalidUrlTestProviders); ++it) {
+  for (size_t i = 0; i < base::size(kInvalidUrlTestProviders); ++i) {
+    const auto& it = kInvalidUrlTestProviders[i];
```

## Note
Several follow-on errors occur because the loop variable `it` is now an integer instead of an iterator and `it->url` is no longer valid.