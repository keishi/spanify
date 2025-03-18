# Build Failure Analysis: 2025_03_14_patch_1879

## First error

../../media/gpu/h264_builder_unittest.cc:29:13: error: use of undeclared identifier 'scaling_list8x8'
   29 |            (scaling_list8x8.size() *
      |             ^

## Category
Rewriter failed to propagate changes from field to usage.

## Reason
The rewriter converted `scaling_list8x8` from a C-style array to `std::array`. This change requires updating the usage of `scaling_list8x8` in `H264BuilderTest::H264BuilderTest`, the `memset` call. However the rewriter failed to update the call site, and thus we get a compiler error.

## Solution
The rewriter needs to update the call site when rewriting C-style arrays to `std::array`. 

## Note
Here is a list of all errors:

```
../../media/gpu/h264_builder_unittest.cc:29:13: error: use of undeclared identifier 'scaling_list8x8'
   29 |            (scaling_list8x8.size() *
      |             ^
../../media/gpu/h264_builder_unittest.cc:30:29: error: use of undeclared identifier 'scaling_list8x8'
   30 |             sizeof(decltype(scaling_list8x8)::value_type)));
      |                             ^
../../media/parsers/h264_parser.cc:595:5: error: no matching function for call to 'memcpy'
  595 |     memcpy(scaling_list8x8[i], kDefault8x8Intra, sizeof(kDefault8x8Intra));
      |     ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:597:5: error: no matching function for call to 'memcpy'
  597 |     memcpy(scaling_list8x8[i], kDefault8x8Inter, sizeof(kDefault8x8Inter));
      |     ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:650:7: error: no matching function for call to 'memcpy'
  650 |       memcpy(scaling_list8x8[i], default_scaling_list_intra,
      |       ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:655:7: error: no matching function for call to 'memcpy'
  655 |       memcpy(scaling_list8x8[i], default_scaling_list_inter,
      |       ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:660:7: error: no matching function for call to 'memcpy'
  660 |       memcpy(scaling_list8x8[i], scaling_list8x8[0], kScalingList8x8ByteSize);
      |       ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:664:7: error: no matching function for call to 'memcpy'
  664 |       memcpy(scaling_list8x8[i], scaling_list8x8[1], kScalingList8x8ByteSize);
      |       ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:668:7: error: no matching function for call to 'memcpy'
  668 |       memcpy(scaling_list8x8[i], scaling_list8x8[2], kScalingList8x8ByteSize);
      |       ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:672:7: error: no matching function for call to 'memcpy'
  672 |       memcpy(scaling_list8x8[i], scaling_list8x8[3], kScalingList8x8ByteSize);
      |       ^~~~~~
../../build/linux/debian_bullseye_amd64-sysroot/usr/include/string.h:43:14: note: candidate function not viable: no known conversion from 'base::span<uint8_t[64]>' (aka 'span<unsigned char[64]>') to 'void *__restrict' for 1st argument; take the address of the argument with &
   43 | extern void *memcpy (void *__restrict __dest, const void *__restrict __src,
      |              ^       ~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:740:30: error: no viable conversion from 'value_type' (aka 'std::array<unsigned char, 64>') to 'uint8_t *' (aka 'unsigned char *')
  740 |                              sps->scaling_list8x8[i], &use_default);
      |                              ^~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:681:58: note: passing argument to parameter 'scaling_list' here
  681 |                                                 uint8_t* scaling_list,
      |                                                          ^
../../media/parsers/h264_parser.cc:745:9: error: no matching function for call to 'DefaultScalingList8x8'
  745 |         DefaultScalingList8x8(i, sps->scaling_list8x8);
      |         ^~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:589:20: note: candidate function not viable: no known conversion from 'std::array<std::array<uint8_t, kH264ScalingList8x8Length>, 6>' (aka 'array<array<unsigned char, kH264ScalingList8x8Length>, 6>') to 'base::span<uint8_t[64]> *' (aka 'span<unsigned char[64]> *') for 2nd argument
  589 | static inline void DefaultScalingList8x8(
      |                    ^
  590 |     int i,
  591 |     base::span<uint8_t[64]> scaling_list8x8[kH264ScalingList8x8Length]) {
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:748:7: error: no matching function for call to 'FallbackScalingList8x8'
  748 |       FallbackScalingList8x8(i, kDefault8x8Intra, kDefault8x8Inter,
      |       ^~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:640:13: note: candidate function not viable: no known conversion from 'std::array<std::array<uint8_t, kH264ScalingList8x8Length>, 6>' (aka 'array<array<unsigned char, kH264ScalingList8x8Length>, 6>') to 'base::span<uint8_t[64]> *' (aka 'span<unsigned char[64]> *') for 4th argument
  640 | static void FallbackScalingList8x8(
      |             ^
  641 |     int i,
  642 |     const uint8_t default_scaling_list_intra[],
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  643 |     const uint8_t default_scaling_list_inter[],
  644 |     base::span<uint8_t[64]> scaling_list8x8[kH264ScalingList8x8Length]) {
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:804:11: error: no matching function for call to 'FallbackScalingList8x8'
  804 |           FallbackScalingList8x8(i, sps.scaling_list8x8[0],
      |           ^~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:640:13: note: candidate function not viable: no known conversion from 'const value_type' (aka 'const std::array<unsigned char, 64>') to 'const uint8_t *' (aka 'const unsigned char *') for 2nd argument
  640 | static void FallbackScalingList8x8(
      |             ^
  641 |     int i,
  642 |     const uint8_t default_scaling_list_intra[],
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:794:32: error: no viable conversion from 'value_type' (aka 'std::array<unsigned char, 64>') to 'uint8_t *' (aka 'unsigned char *')
  794 |                                pps->scaling_list8x8[i], &use_default);
      |                                ^~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:681:58: note: passing argument to parameter 'scaling_list' here
  681 |                                                 uint8_t* scaling_list,
      |                                                          ^
../../media/parsers/h264_parser.cc:799:11: error: no matching function for call to 'DefaultScalingList8x8'
  799 |           DefaultScalingList8x8(i, pps->scaling_list8x8);
      |           ^~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:589:20: note: candidate function not viable: no known conversion from 'std::array<std::array<uint8_t, kH264ScalingList8x8Length>, 6>' (aka 'array<array<unsigned char, kH264ScalingList8x8Length>, 6>') to 'base::span<uint8_t[64]> *' (aka 'span<unsigned char[64]> *') for 2nd argument
  589 | static inline void DefaultScalingList8x8(
      |                    ^
  590 |     int i,
  591 |     base::span<uint8_t[64]> scaling_list8x8[kH264ScalingList8x8Length]) {
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:804:11: error: no matching function for call to 'FallbackScalingList8x8'
  804 |           FallbackScalingList8x8(i, kDefault8x8Intra, kDefault8x8Inter,
      |           ^~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:640:13: note: candidate function not viable: no known conversion from 'std::array<std::array<uint8_t, kH264ScalingList8x8Length>, 6>' (aka 'array<array<unsigned char, kH264ScalingList8x8Length>, 6>') to 'base::span<uint8_t[64]> *' (aka 'span<unsigned char[64]> *') for 4th argument
  640 | static void FallbackScalingList8x8(
      |             ^
  641 |     int i,
  642 |     const uint8_t default_scaling_list_intra[],
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  643 |     const uint8_t default_scaling_list_inter[],
  644 |     base::span<uint8_t[64]> scaling_list8x8[kH264ScalingList8x8Length]) {
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:808:11: error: no matching function for call to 'FallbackScalingList8x8'
  808 |           FallbackScalingList8x8(i, sps.scaling_list8x8[0],
      |           ^~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:640:13: note: candidate function not viable: no known conversion from 'const value_type' (aka 'const std::array<unsigned char, 64>') to 'const uint8_t *' (aka 'const unsigned char *') for 2nd argument
  640 | static void FallbackScalingList8x8(
      |             ^
  641 |     int i,
  642 |     const uint8_t default_scaling_list_intra[],
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/parsers/h264_parser.cc:930:8: error: use of undeclared identifier 'scaling_list8x8'
  930 |       (scaling_list8x8.size() * sizeof(decltype(scaling_list8x8)::value_type)));
      |        ^
../../media/parsers/h264_parser.cc:930:49: error: use of undeclared identifier 'scaling_list8x8'
  930 |       (scaling_list8x8.size() * sizeof(decltype(scaling_list8x8)::value_type)));
      |                                                 ^