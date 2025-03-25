# Build Failure Analysis: 2025_03_19_patch_1217

## First error

../../media/parsers/h264_parser.cc:595:5: error: no matching function for call to 'memcpy'
  595 |     memcpy(scaling_list8x8[i], kDefault8x8Intra, sizeof(kDefault8x8Intra));
      |     ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DefaultScalingList8x8` was modified to take a `base::span` argument. The call site `memcpy(scaling_list8x8[i], ...)` is now invalid because `scaling_list8x8[i]` results in a `base::span<uint8_t[64]>` object, and `memcpy` expects a `void*` destination.  The rewriter needs to insert `.data()` to get the raw pointer.

## Solution
The rewriter should insert `.data()` at the call sites of `memcpy` to pass a pointer to the underlying data. For example, the first error should be rewritten as `memcpy(scaling_list8x8[i].data(), kDefault8x8Intra, sizeof(kDefault8x8Intra));`

## Note
Several other errors in the build log have the same root cause and similar solutions. Also, there are errors caused by the code trying to pass `sps->scaling_list8x8[i]` as a function argument to `FallbackScalingList8x8`. This call should also be rewritten to pass `sps->scaling_list8x8[i].data()`.