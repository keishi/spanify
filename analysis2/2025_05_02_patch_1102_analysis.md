# Build Failure Analysis: 2025_05_02_patch_1102

## First error

../../components/image_fetcher/core/image_fetcher_metrics_reporter.cc:160:3: error: no matching function for call to 'UmaHistogramSparse'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is calling `base::UmaHistogramSparse` with `kNetworkRequestStatusCodes`, which was converted from a `char[]` to a `std::array<char, 31>`. The `base::UmaHistogramSparse` function expects a `const std::string&`, `const char*`, or `std::string_view`, so it's necessary to pass the underlying C-style string by calling `.data()` on the `std::array`.

## Solution
The rewriter needs to append `.data()` to the `std::array` variable when it's passed to a function expecting a C-style string or a `std::string`.

In this case, the rewriter should rewrite:
```c++
base::UmaHistogramSparse(kNetworkRequestStatusCodes, code);
```
to:
```c++
base::UmaHistogramSparse(kNetworkRequestStatusCodes.data(), code);
```
and
```c++
kNetworkRequestStatusCodes.data() + std::string(".") + client_name
```

## Note
The second error is also because the rewriter did not append `.data()` when using `std::string`.
```c++
kNetworkRequestStatusCodes.data() + std::string(".") + client_name
```