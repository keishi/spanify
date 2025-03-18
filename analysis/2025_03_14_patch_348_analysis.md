# Build Failure Analysis: 2025_03_14_patch_348

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/es_descriptor_unittest.cc at offset 2862, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2868, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to the spanified `buffer`, but also rewrite `sizeof(buffer)` (or similar). These replacements overlap, causing the build failure. The replacements were:

1.  `(buffer.size() * sizeof(decltype(buffer)::value_type))`
2.  `.data()`

The overlapping occurs because `data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));` is rewritten in two steps. First the `buffer` in `sizeof(buffer)` is rewritten to `(buffer.size() * sizeof(decltype(buffer)::value_type))` and that happens to be right next to buffer in `base::span<uint8_t>(buffer )` and then the second rewrite overlaps.

## Solution
The rewriter should avoid overlapping replacements by making sure to not rewrite code where span additions will happen.

## Note
The error message shows that the overlap is happening within the `media/formats/mp4/es_descriptor_unittest.cc` file.