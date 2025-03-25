```
# Build Failure Analysis: 2025_03_19_patch_1146

## First error

../../media/gpu/vaapi/h264_vaapi_video_encoder_delegate.cc:151:35: error: no matching function for call to 'to_array'
  151 |   constexpr auto kFrameMetadata = std::to_array<
      |                                   ^~~~~~~~~~~~~~

## Category
Rewriter cannot get the size of forward declared array variable.

## Reason
The rewriter attempted to use `std::to_array` on a braced initializer list without a specified size. However, `std::to_array` needs the size of the array to be known at compile time, either explicitly or through deduction from the initializer list's type. In this case, the type of the initializer list, `std::array<std::pair<H264Metadata, bool>, kTemporalLayerCycle>>`, doesn't match the initializer list's size, which is 2. The fix is to pass the braced initializer list directly to `std::array`.

## Solution
The rewriter should avoid using `std::to_array` when the return type is not matching the input size, specifically when used to initialize a `std::array`. Remove `std::to_array` and initialize `kFrameMetadata` directly using `std::array`.

```diff
--- a/media/gpu/vaapi/h264_vaapi_video_encoder_delegate.cc
+++ b/media/gpu/vaapi/h264_vaapi_video_encoder_delegate.cc
@@ -2,6 +8,8 @@
 // found in the LICENSE file.
 
+#include <array>
+
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/40285824): Remove this and convert code to safer constructs.
 #pragma allow_unsafe_buffers
@@ -146,22 +148,22 @@ void UpdatePictureForTemporalLayerEncoding(
   DCHECK_GE(num_layers, kMinSupportedH264TemporalLayers);
   DCHECK_LE(num_layers, kMaxSupportedH264TemporalLayers);
   constexpr size_t kTemporalLayerCycle = 4;
--  constexpr std::pair<H264Metadata, bool>
-      kFrameMetadata[][kTemporalLayerCycle] = {
-          {
-              // For two temporal layers.
-              {{.temporal_idx = 0, .layer_sync = false}, true},
-              {{.temporal_idx = 1, .layer_sync = true}, false},
-              {{.temporal_idx = 0, .layer_sync = false}, true},
-              {{.temporal_idx = 1, .layer_sync = true}, false},
-          },
-          {
-              // For three temporal layers.
-              {{.temporal_idx = 0, .layer_sync = false}, true},
-              {{.temporal_idx = 2, .layer_sync = true}, false},
-              {{.temporal_idx = 1, .layer_sync = true}, true},
-              {{.temporal_idx = 2, .layer_sync = false}, false},
-          }};
+  constexpr auto kFrameMetadata = std::array<
+      std::array<std::pair<H264Metadata, bool>, kTemporalLayerCycle>, 2>(
+      {{
+           // For two temporal layers.
+           {{{.temporal_idx = 0, .layer_sync = false}, true},
+            {{.temporal_idx = 1, .layer_sync = true}, false},
+            {{.temporal_idx = 0, .layer_sync = false}, true},
+            {{.temporal_idx = 1, .layer_sync = true}, false}},
+       },
+       {
+           // For three temporal layers.
+           {{{.temporal_idx = 0, .layer_sync = false}, true},
+            {{.temporal_idx = 2, .layer_sync = true}, false},
+            {{{.temporal_idx = 1, .layer_sync = true}, true},
+            {{.temporal_idx = 2, .layer_sync = false}, false}},
+       }});
 
   // Fill |pic.metadata_for_encoding| and |pic.ref|.
   std::tie(pic.metadata_for_encoding.emplace(), pic.ref) =
```

## Note
The original code uses `constexpr std::pair<H264Metadata, bool> kFrameMetadata[][kTemporalLayerCycle]`. Rewriting it to `constexpr auto kFrameMetadata = std::array<std::array<std::pair<H264Metadata, bool>, kTemporalLayerCycle>, 2>` is probably what the rewriter is trying to achieve.