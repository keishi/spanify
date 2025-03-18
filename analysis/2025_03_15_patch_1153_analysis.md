# Build Failure Analysis: 2025_03_15_patch_1153

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/es_descriptor_unittest.cc at offset 2862, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2868, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to perform two replacements in the same region of the code. The first replacement was likely related to rewriting `sizeof(buffer)` or `buffer.size()` calls, and the second was an attempt to add `.data()` to a converted array. Because the locations of the replacements overlapped, the tool was unable to apply the changes.

## Solution
The rewriter should be modified to avoid generating overlapping replacements. This might involve ensuring that only one replacement is generated for a given region, or adjusting the replacement logic to handle cases where multiple replacements might be necessary.

## Note
This is an instance of overlapping replacements and RewriteArraySizeof and AppendDataCall.