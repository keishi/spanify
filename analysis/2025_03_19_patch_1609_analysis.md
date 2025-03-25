```
# Build Failure Analysis: 2025_03_19_patch_1609

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:114:10: error: no matching function for call to 'LoadCompressedTexture'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed `uint16_t data[kStride * kPaletteSize]` to `std::array<uint16_t, kStride * kPaletteSize> data`. The function `LoadCompressedTexture` expects a `const void*` as the first argument, but the rewriter did not add `.data()` when passing the std::array `data` to the function, leading to a type mismatch.

## Solution
The rewriter needs to add `.data()` to the `data` variable when it's passed to the `LoadCompressedTexture` function.

```diff
--- a/gpu/command_buffer/tests/compressed_texture_test.cc
+++ b/gpu/command_buffer/tests/compressed_texture_test.cc
@@ -109,6 +109,7 @@
     data[j++] = kColor1;  // color index.
   }
 -  return LoadCompressedTexture(data,
+
 +  return LoadCompressedTexture(data.data(),
                                sizeof(data),
                                GL_COMPRESSED_RGBA_S3TC_DXT3_EXT,

```

## Note
No secondary errors found in the log.