# Build Failure Analysis: 2025_03_14_patch_94

## First error

```
Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/mojo/public/cpp/base/big_buffer.h at offset 6111, length 8: "" and offset 6113, length 0: "*"
```

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter attempts to spanify two separate but overlapping locations. This is likely due to two similar transformations attempting to rewrite the same code region, resulting in overlapping replacements that the tool cannot handle.

## Solution
The rewriter needs to ensure that when applying replacements, it checks for overlapping regions and avoids generating replacements that conflict with existing ones. This could involve sorting replacements by offset and length, and then skipping any replacements that would overlap with a previously applied replacement.

## Note
Additional overlapping replacements exist:

*   /usr/local/google/home/nuskos/chromium-team/chromium/src/mojo/public/cpp/base/big_buffer.h at offset 5903, length 8: "" and offset 5905, length 0: "*"
*   /usr/local/google/home/nuskos/chromium-team/chromium/src/mojo/public/cpp/base/big_buffer.h at offset 5681, length 8: "" and offset 5683, length 0: "*"
*   /usr/local/google/home/nuskos/chromium-team/chromium/src/mojo/public/cpp/base/big_buffer.h at offset 5277, length 8: "" and offset 5279, length 0: "*"
*   /usr/local/google/home/nuskos/chromium-team/chromium/src/media/base/video_util_unittest.cc at offset 3492, length 15: "base::span<const uint8_t>" and offset 3492, length 31: "base::span<const uint8_t>"