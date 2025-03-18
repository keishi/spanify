# Build Failure Analysis: 2025_03_14_patch_249

## First error

../../ui/base/resource/resource_bundle.cc:142:41: error: reinterpret_cast from 'std::string_view' (aka 'basic_string_view<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Bad cast with `reinterpret_cast`.

## Reason
The code is attempting to use `reinterpret_cast` to cast a `std::string_view` to a `const uint8_t*`. This type of cast is generally unsafe and is disallowed in Chromium. The compiler is preventing this type conversion, because it potentially bypasses type safety and memory safety checks.

## Solution
Use `as_bytes` method from span API to convert from `std::string_view` to `base::span<const uint8_t>`.

```c++
  base::span<const uint8_t> raw_input = base::as_bytes(input);
  raw_input = raw_input.subspan(std::size(ResourceBundle::kBrotliConst));
  // Get size of uncompressed resource from header.
  uint64_t uncompress_size = 0;
  int bytes_size = static_cast<int>(ResourceBundle::kBrotliHeaderSize -
                                     std::size(ResourceBundle::kBrotliConst));
  for (int i = 0; i < bytes_size; i++) {
    uncompress_size |= static_cast<uint64_t>((raw_input.subspan(i)[0]))
                       << (i * 8);
  }
```

## Note
The second error is caused by the fact that the index `i` is an `int` and the `subspan()` method requires an unsigned type. The rewriter should automatically add a cast to `static_cast<size_t>(i)`.
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}