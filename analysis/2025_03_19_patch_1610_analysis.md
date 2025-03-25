# Build Failure Analysis: 2025_03_19_patch_1610

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:138:10: error: no matching function for call to 'LoadCompressedTexture'
  138 |   return LoadCompressedTexture(
      |          ^~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `LoadCompressedTexture` expects a raw pointer as its first argument. The rewriter converted the `data` variable to `std::array`, but it failed to add `.data()` when passing it to `LoadCompressedTexture`.

## Solution
The rewriter needs to add `.data()` to the `data` variable when it's passed as an argument to `LoadCompressedTexture`. The correct call should be:

```c++
return LoadCompressedTexture(
      data.data(), (data.size() * sizeof(decltype(data)::value_type)),
      GL_COMPRESSED_RGBA_S3TC_DXT5_EXT, kTextureWidth, kTextureHeight);