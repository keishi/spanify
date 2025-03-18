# Build Failure Analysis: 2025_03_14_patch_1865

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/aac_unittest.cc at offset 5618, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 5624, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to insert ".data()" at the end of `buffer` while simultaneously attempting to rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type))`. Because the ".data()" is being added inside the sizeof expression, the replacements now overlap.

## Solution
Ensure RewriteArraySizeof and AppendDataCall do not overlap. One possible solution is to avoid RewriteArraySizeof when the array variable requires AppendDataCall.

## Note
The overlapping replacements occurred in this line of code:
```c++
data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));
```