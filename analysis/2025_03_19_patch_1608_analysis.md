# Build Failure Analysis: 2025_03_19_patch_1608

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:94:10: error: no matching function for call to 'LoadCompressedTexture'
   94 |   return LoadCompressedTexture(
      |          ^~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/tests/compressed_texture_test.cc:64:15: note: candidate function not viable: no known conversion from 'std::array<uint16_t, kStride * kPaletteSize>' (aka 'array<unsigned short, kStride * kPaletteSize>') to 'const void *' for 1st argument; take the address of the argument with &

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The code was changed to use `std::array` instead of a raw array. However, the function `LoadCompressedTexture` expects a `const void*` as its first argument. The rewriter did not insert the `.data()` call to get the underlying pointer from the `std::array`. The compiler error indicates that there is no implicit conversion from `std::array<uint16_t, kStride * kPaletteSize>` to `const void*`, and suggests taking the address of the argument with `&`. While taking the address would fix this specific error, it's not the correct general solution. The correct solution is to call .data() on the `std::array` to get a pointer to the underlying data.

## Solution
The rewriter should insert `.data()` after the `data` variable when it is passed as an argument to the `LoadCompressedTexture` function. The corrected code would be:

```c++
return LoadCompressedTexture(
    data.data(), (data.size() * sizeof(decltype(data)::value_type)), format,
    kTextureWidth, kTextureHeight);
```

## Note
None