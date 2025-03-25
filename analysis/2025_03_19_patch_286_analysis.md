# Build Failure Analysis: 2025_03_19_patch_286

## First error

../../third_party/blink/renderer/modules/credentialmanagement/credential_manager_type_converters_unittest.cc:302:32: error: member reference base type 'const uint8_t[6]' (aka 'const unsigned char[6]') is not a structure or union
  302 |       arrayBufferOrView(kSample.data(), std::size(kSample)));
      |                         ~~~~~~~^~~~~

## Category
Rewriter needs to add .data() to a variable/member it did not spanify/arrayify.

## Reason
In the original code, `kSample` is a C-style array, and `.data()` is called on it in multiple locations to pass it to the `arrayBufferOrView` function. In this patch, the signature of `vectorOf` function was spanified, so `.data()` was added in the call site in `vectorOf`, however the calls to `arrayBufferOrView` was missed, and thus triggered a compiler error because `arrayBufferOrView` wasn't expecting the span type.

## Solution
The rewriter needs to identify places where spanified code consumes `char[]` or `unsigned char[]` data and add `.data()` calls to convert them to `span`s.

## Note
The other errors have the same root cause.