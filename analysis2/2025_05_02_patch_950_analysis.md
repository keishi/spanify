# Build Failure Analysis: 2025_05_02_patch_950

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:140:10: error: no matching function for call to 'LoadCompressedTexture'
  140 |   return LoadCompressedTexture(
      |          ^~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/tests/compressed_texture_test.cc:66:15: note: candidate function not viable: no known conversion from 'std::array<uint16_t, kStride * kPaletteSize>' (aka 'array<unsigned short, kStride * kPaletteSize>') to 'const void *' for 1st argument; take the address of the argument with &

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `uint16_t data[kStride * kPaletteSize]` to `std::array<uint16_t, kStride * kPaletteSize> data;`. However, the `LoadCompressedTexture` function expects a `const void*` as the first argument, which is the pointer to the data. The rewriter failed to add `.data()` to get the underlying pointer of the `std::array`.

## Solution
The rewriter needs to add `.data()` to the `data` variable when it is passed to `LoadCompressedTexture`. The correct code should be:
```c++
  return LoadCompressedTexture(
      data.data(), (data.size() * sizeof(decltype(data)::value_type)),
      GL_COMPRESSED_RGBA_S3TC_DXT5_EXT, kTextureWidth, kTextureHeight);
```

## Note
N/A