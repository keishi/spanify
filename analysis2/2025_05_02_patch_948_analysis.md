# Build Failure Analysis: 2025_05_02_patch_948

## First error

../../gpu/command_buffer/tests/compressed_texture_test.cc:96:10: error: no matching function for call to 'LoadCompressedTexture'
   96 |   return LoadCompressedTexture(
      |          ^~~~~~~~~~~~~~~~~~~~~
../../gpu/command_buffer/tests/compressed_texture_test.cc:66:15: note: candidate function not viable: no known conversion from 'std::array<uint16_t, kStride * kPaletteSize>' (aka 'array<unsigned short, kStride * kPaletteSize>') to 'const void *' for 1st argument; take the address of the argument with &

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter converted `uint16_t data[kStride * kPaletteSize];` to `std::array<uint16_t, kStride * kPaletteSize> data;`. The code then passes `data` to a function expecting a `const void*`. The fix is to pass `&data[0]` or `data.data()`.

## Solution
The rewriter should recognize this pattern and pass `&data[0]` or `data.data()` instead of `data`.

## Note