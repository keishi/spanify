# Build Failure Analysis: 2025_03_19_patch_1032

## First error

./media/base/video_util_unittest.cc:3492:7: error: Conflicting replacement text: ./media/base/video_util_unittest.cc at offset 3492, length 15: "base::span<const uint8_t>" != "./media/base/video_util_unittest.cc at offset 3492, length 31: "base::span<const uint8_t>"

## Category
Overlapping replacements in macro.

## Reason
The error indicates conflicting replacement text at the same location. This likely occurs because a macro is being used in multiple places, and the rewriter is generating the same replacement for each use of the macro. The conflicting replacement attempts arise from different expansions of the macro at the same location.

## Solution
The rewriter needs to be made aware of the presence of the macro to avoid generating multiple replacements for the same location or generate replacement only at macro definition. This likely requires modifying the AST matcher or the replacement logic to account for macros.

## Note
There are also errors related to `"" and offset 5905, length 0: "*"`. This is another instance of overlapping replacements.