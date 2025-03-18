# Build Failure Analysis: 2025_03_14_patch_950

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:94:10: error: no matching function for call to 'LoadCompressedTexture'
   94 |   return LoadCompressedTexture(
      |          ^~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/tests/compressed_texture_test.cc:64:15: note: candidate function not viable: no known conversion from 'std::array<uint16_t, kStride * kPaletteSize>' (aka 'array<unsigned short, kStride * kPaletteSize>') to 'const void *' for 1st argument; take the address of the argument with &

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
When converting a C-style array to `std::array`, the rewriter should add `.data()` when that variable is passed to a third_party function call.  However, the function `LoadCompressedTexture` is not third party. The rewriter did add `.data()` to the second argument, which is the `sizeof()` operator, not the actual buffer itself.

## Solution
The rewriter should add `.data()` when an `std::array` is being passed to a function that expects a pointer. In the case of `LoadCompressedTexture` the code should have been rewritten to:

```c++
  return LoadCompressedTexture(
      data.data(), (data.size() * sizeof(decltype(data)::value_type)), format,
      kTextureWidth, kTextureHeight);
```

## Note
No notes.