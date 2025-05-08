# Build Failure Analysis: 2025_05_02_patch_949

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:116:10: error: no matching function for call to 'LoadCompressedTexture'

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `uint16_t data[kStride * kPaletteSize]` to `std::array<uint16_t, kStride * kPaletteSize> data;`. But when `data` is passed to `LoadCompressedTexture`, the rewriter failed to add `.data()` to decay the `std::array` to a pointer.

## Solution
The rewriter should add `.data()` when an arrayified variable is passed to a third_party function call.

## Note