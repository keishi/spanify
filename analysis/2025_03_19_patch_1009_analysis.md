# Build Failure Analysis: 2025_03_19_patch_1009

## First error

../../media/parsers/vp9_parser.cc:928:7: error: no matching function for call to 'memset'
  928 |       memset(loop_filter.lvl[i], level, sizeof(loop_filter.lvl[i]));

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is trying to rewrite media/parsers/vp9_parser.cc, but this file includes

```
#ifdef UNSAFE_BUFFERS_BUILD
// TODO(crbug.com/40285824): Remove this and convert code to safer constructs.
#pragma allow_unsafe_buffers
```

This pragma instructs the rewriter to leave this file untouched. As a result when converting `uint8_t lvl[Vp9SegmentationParams::kNumSegments][VP9_FRAME_MAX] [kNumModeDeltas];` to `std::array` the code that calls `memset` no longer compiles.

## Solution
The rewriter should avoid spanifying code if it will require spanifying excluded code.

## Note
This is a perfect example of why the rewriter should check if a change it generates will trigger compilation errors.