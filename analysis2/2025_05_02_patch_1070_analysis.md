# Build Failure Analysis: 2025_05_02_patch_1070

## First error

```
./media/base/video_util_unittest.cc:349:3: error: Conflicting replacement text: "base::span<const uint8_t>" != "base::span<const uint8_t>"
```

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter is attempting to make two different replacements in the same region of the file. This happens because the `binary_plus_or_minus_operation` matcher matches more than once, triggering the same replacements multiple times.

## Solution
The code to unpack binaryOperations recursively must only trigger a replacement once.

## Note
The other overlapping replacements are similar:
```
./mojo/public/cpp/base/big_buffer.h at offset 6111, length 8: "" and offset 6113, length 0: "*"
./mojo/public/cpp/base/big_buffer.h at offset 5903, length 8: "" and offset 5905, length 0: "*"
./mojo/public/cpp/base/big_buffer.h at offset 5681, length 8: "" and offset 5683, length 0: "*"
./mojo/public/cpp/base/big_buffer.h at offset 5277, length 8: "" and offset 5279, length 0: "*"
```