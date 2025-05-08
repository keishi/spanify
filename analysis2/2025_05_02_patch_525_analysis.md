# Build Failure Analysis: 2025_05_02_patch_525

## First error

../../media/filters/ffmpeg_aac_bitstream_converter.cc:237:32: error: member reference base type 'uint8_t[7]' (aka 'unsigned char[7]') is not a structure or union
  237 |   memcpy(dest_packet.data, hdr_.data(), kAdtsHeaderSize);
      |                            ~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `hdr_` member, which is a `uint8_t[7]`. This is incorrect because the rewriter converts C-style array to std::array and not base::span member variables (unless there is an unsafe buffer access on the member variable). Thus there is no `.data()` method and the code no longer compiles.

## Solution
The rewriter should not add `.data()` to `hdr_`, since it did not spanify/arrayify it. The correct code is `memcpy(dest_packet.data, hdr_, kAdtsHeaderSize);`.

## Note
The `GenerateAdtsHeader` function should have been changed from `uint8_t* hdr` to `std::array<uint8_t, 7> hdr`. Also `memcpy(reinterpret_cast<void*>(hdr.data()), 0, FFmpegAACBitstreamConverter::kAdtsHeaderSize);` should have been `memcpy(reinterpret_cast<void*>(hdr.data()), 0, FFmpegAACBitstreamConverter::kAdtsHeaderSize);`