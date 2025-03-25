# Build Failure Analysis: 2025_03_19_patch_1316

## First error

../../mojo/public/cpp/base/big_buffer.h:123:28: error: const_cast from 'const base::span<uint8_t>' (aka 'const span<unsigned char>') to 'uint8_t *' (aka 'unsigned char *') is not allowed

## Category
Rewriter needs to avoid using const_cast on spanified variable.

## Reason
The rewriter spanified `data()` to return `base::span<uint8_t>`, but also introduced a const_cast. This is not allowed. The original code had no cast.

## Solution
The rewriter should not introduce const_cast. The `data()` function should determine its return type by whether the `BigBuffer` is const.

```c++
  uint8_t* data() { return data_.data(); }
  const uint8_t* data() const { return data_.data(); }