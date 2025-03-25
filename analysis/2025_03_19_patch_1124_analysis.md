# Build Failure Analysis: 2025_03_19_patch_1124

## First error

../../dbus/message_unittest.cc:284:40: error: cannot initialize a parameter of type 'const uint32_t **' (aka 'const unsigned int **') with an rvalue of type 'base::span<const uint32_t> *' (aka 'span<const unsigned int> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `MessageReader::PopArrayOfUint32s` expects a `const uint32_t**` as its first argument, but the rewriter is passing `base::span<const uint32_t>*`. The rewriter spanified the test file, but failed to spanify the `PopArrayOfUint32s` method in the `MessageReader` class. This is a call site issue because the signature of PopArrayOfUint32s was not changed to base::span.

## Solution
The rewriter needs to spanify the `PopArrayOfUint32s` to accept a `base::span<const uint32_t>`.

## Note
This is a classic case where the rewriter spanified a call site but did not spanify the function being called.