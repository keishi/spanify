# Build Failure Analysis: 2025_03_14_patch_922

## First error

../../chrome/browser/devtools/device/usb/android_usb_browsertest.cc:372:9: error: reinterpret_cast from 'const std::string' (aka 'const basic_string<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter tried to spanify a call site in `AndroidUsbBrowserTest`, but it was passing a `std::string` into a `reinterpret_cast<const uint8_t*>()`. Rewriting the call site of this particular function requires rewriting the `std::string` to `.data()`. However, third party code can't be rewritten, which is why the code failed.

## Solution
The rewriter needs to avoid spanifying `FakeAndroidUsbDevice::append` since it requires rewriting the `std::string` object which is not supported by the tool.

## Note
The spanified code has an error with `body_head.subspan(body.size()).data()` that can be avoided by removing the `.data()`.