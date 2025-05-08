# Build Failure Analysis: 2025_05_02_patch_349

## First error

../../chrome/browser/ui/views/page_info/page_info_permission_content_view_unittest.cc:176:52: error: no matching constructor for initialization of 'const media::VideoCaptureDeviceDescriptor &'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to construct a `media::VideoCaptureDeviceDescriptor` using a `std::array<char, 12>` as the first argument. The constructor expects a `const std::string&`, not a `std::array`. The rewriter arrayified the `kCameraName` variable, but did not add `.data()` when it is being used to construct the object.

## Solution
The rewriter needs to add `.data()` to the `kCameraName` variable when it is used as an argument to a function that expects a `const std::string&`.

## Note
The same error happened again at line 209.