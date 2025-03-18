# Build Failure Analysis: 2025_03_14_patch_250

## First error

../../ui/base/resource/resource_bundle.cc:130:42: error: reinterpret_cast from 'std::string_view' (aka 'basic_string_view<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed
  130 |   base::span<const uint8_t> data_bytes = reinterpret_cast<const uint8_t*>(data);

## Category
Rewriter needs to avoid spanifying variables used in reinterpret_cast.

## Reason
The code is trying to create a `base::span<const uint8_t>` from a `std::string_view` by using `reinterpret_cast`. The span rewriter spanified the `data` variable to `base::span<const char>`, but this made the `reinterpret_cast` invalid, because you cannot directly `reinterpret_cast` to `base::span`.

## Solution
The rewriter needs to avoid spanifying the `data` variable if it's used in a `reinterpret_cast`. A safe way is to cast `std::string_view` to `std::string` first, then cast to `base::span`:

```c++
base::span<const uint8_t> data_bytes = base::as_bytes(std::string(data));
```

A simpler way might be to just replace the usage of `base::span` with `std::string_view`, since `std::string_view` has similar functionality.

## Note
The second error is a direct result of the first error and doesn't introduce any new categories.