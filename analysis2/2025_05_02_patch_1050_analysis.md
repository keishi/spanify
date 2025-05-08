# Build Failure Analysis: 2025_05_02_patch_1050

## First error

../../components/webauthn/json/value_conversions_unittest.cc:79:38: error: reinterpret_cast from 'std::string_view' (aka 'basic_string_view<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified `in`, but left a `reinterpret_cast` that is applied to it. The `reinterpret_cast` is no longer valid now that `in` is a `std::string_view`.

## Solution
The rewriter should be able to remove the `reinterpret_cast` when it spanifies a variable. The correct way to spanify `in` would be to just assign it directly.
```c++
  base::span<const uint8_t> in_ptr = base::as_bytes(base::make_span(in));
  return std::vector<uint8_t>(in_ptr.data(), in_ptr.subspan(in.size()).data());
```

## Note
There is a second error that would occur if the first one was fixed, because the code calls subspan on `in.size()` which is incorrect. It should not have been converted into `in.subspan()`.
```c++
  return std::vector<uint8_t>(in_ptr.data(), in_ptr.subspan(in.size()).data());
```