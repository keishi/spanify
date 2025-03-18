```
# Build Failure Analysis: 2025_03_14_patch_467

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/services/data_decoder/image_decoder_impl_unittest.cc at offset 5964, length 19: "(kRandomData.size() * sizeof(decltype(kRandomData)::value_type))" and offset 5970, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The error "Overlapping replacements" indicates that two different rewrite rules are trying to modify the same region of code, causing a conflict. In this case, the `RewriteArraySizeof` rule is trying to replace `(kRandomData.size() * sizeof(decltype(kRandomData)::value_type))` while the `AppendDataCall` rule attempts to add `.data()` to `kRandomData` resulting in overlapping replacements. The overlapping region starts at offset 5970.

## Solution
The rewriter needs to be adjusted to avoid applying conflicting transformations. It should check if a replacement has already been scheduled for a given range before attempting to add another one that overlaps. A possible solution is to prioritize one replacement over the other or to combine them into a single replacement. Specifically:
1.  Prioritize appending `.data()` first. The `RewriteArraySizeof` should check if the `.data()` has already been appended. In that case, it should skip rewriting `sizeof`.
2.  Another approach to ensure no overlap is to make the `AppendDataCall` rewrite more robust such that it accounts for the `RewriteArraySizeof` rewrite having already happened.

## Note
The diff is:
```diff
--- a/services/data_decoder/image_decoder_impl_unittest.cc
+++ b/services/data_decoder/image_decoder_impl_unittest.cc
@@ -2,6 +8,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include <string_view>
+
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/351564777): Remove this and convert code to safer constructs.
 #pragma allow_unsafe_buffers
@@ -181,9 +183,9 @@ TEST_F(ImageDecoderImplTest, DecodeImageSizeLimit) {
 
 TEST_F(ImageDecoderImplTest, DecodeImageFailed) {
   // The "jpeg" is just some "random" data;
-  const char kRandomData[] = "u gycfy7xdjkhfgui bdui ";
-  std::vector<unsigned char> jpg(kRandomData,
-                                 kRandomData + sizeof(kRandomData));
+  const std::string_view kRandomData = "u gycfy7xdjkhfgui bdui ";
+  std::vector<unsigned char> jpg(kRandomData.data(),
+                                 base::span<const char>(kRandomData ).subspan( sizeof).data()(kRandomData));
 
   Request request(decoder());
   request.DecodeImage(jpg, false);
```
It appears the overlapping replacements occur on line 184.