# Build Failure Analysis: 2025_03_19_patch_1567

## First error

../../ui/display/util/edid_parser_unittest.cc:386:35: error: [chromium-rawptr] Use raw_span<T> instead of a span<T>.

## Category
Rewriter failed to replace `span<T>` with `raw_span<T>`.

## Reason
The rewriter encountered `base::span<const unsigned char>` and suggested that we replace it with `base::raw_span<const unsigned char>`. However it failed to consider when this is a member of a struct:

```c++
struct TestParams {
  base::span<const unsigned char> edid_blob;
```

## Solution
The rewriter needs to replace `base::span` with `base::raw_span` inside structs too.