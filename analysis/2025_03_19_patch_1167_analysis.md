# Build Failure Analysis: 2025_03_19_patch_1167

## First error

../../chrome/browser/ui/views/page_info/page_info_permission_content_view_unittest.cc:175:52: error: no matching constructor for initialization of 'const media::VideoCaptureDeviceDescriptor &'
  175 |   ASSERT_TRUE(video_service_.AddFakeCameraBlocking({kCameraName, kCameraId}));
      |                                                    ^~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to use a `std::array<char, 12>` where a `std::string` is expected. `VideoCaptureDeviceDescriptor`'s constructor expects a `const std::string&` but is receiving `const std::array<char, 12>`. The rewriter converted `kCameraName` from `char[]` to `std::array<char, 12>`, but it needs to also add `.data()` when this variable is used in a context where `std::string` is expected.

## Solution
The rewriter should add `.data()` to arrayified `char[]` variable used with std::string. The code should be changed as follows:

```diff
--- a/chrome/browser/ui/views/page_info/page_info_permission_content_view_unittest.cc
+++ b/chrome/browser/ui/views/page_info/page_info_permission_content_view_unittest.cc
@@ -173,7 +175,7 @@ TEST_F(PageInfoPermissionContentViewTestMediaPreview, MediaPreviewCamera) {
   ASSERT_TRUE(video_service_.AddFakeCameraBlocking({kCameraName, kCameraId}));
   EXPECT_EQ(title_label->GetText(), GetExpectedCameraLabelText(1));
   EXPECT_EQ(title_label->GetRenderedTooltipText(gfx::Point()),
-            base::UTF8ToUTF16(std::string(kCameraName)));
+            base::UTF8ToUTF16(std::string(kCameraName.data())));

```

## Note
The same error happens on line 208. This category encompasses both of these.