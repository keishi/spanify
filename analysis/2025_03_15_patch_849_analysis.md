# Build Failure Analysis: 2025_03_15_patch_849

## First error

../../media/cdm/aes_decryptor_unittest.cc:248:24: error: no matching conversion for functional-style cast from 'const std::string_view' (aka 'const basic_string_view<char>') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  248 |                        base::span<const uint8_t>(kOriginalData)
      |                        ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to account for `std::string_view` -> `base::span<uint8_t>` conversion.

## Reason
The code attempts to construct a `base::span<const uint8_t>` from `kOriginalData`, which is now a `std::string_view`. There is no implicit conversion available, so it is failing the build.
Rewriter needs to convert `kOriginalData` to a `base::span<const uint8_t>`.

## Solution
The rewriter should insert a cast to `const uint8_t*` and use `remove_cvref_t` to deduce a proper type. `base::span` has a constructor which accepts `const uint8_t*` as an input.

```c++
base::span<const uint8_t>(reinterpret_cast<const uint8_t*>(kOriginalData.data()), kOriginalData.size())
```

## Note
There are three errors in this file. It also appears that `kOriginalDataSize` is unused and can be removed. It looks like `StrictNumeric` cast failed because of `int` -> `unsigned long`.