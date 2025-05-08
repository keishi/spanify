# Build Failure Analysis: 2025_05_02_patch_830

## First error

../../dbus/property.cc:630:40: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `struct_reader.PopArrayOfBytes` expects a `const uint8_t** bytes` (pointer to pointer to const uint8_t) but the code is passing a `base::span<const uint8_t>* bytes`. The rewriter introduced the spanification but didn't update the call site.

## Solution
The rewriter needs to spanify the function `struct_reader.PopArrayOfBytes` to accept a `base::span<const uint8_t>`, or alternatively, convert the span to a raw pointer before passing it to the function, although the first option is likely preferable for consistency.

## Note
The code is trying to assign a span to a pointer, which is incorrect. The correct usage would be to pass the address of a pointer to `PopArrayOfBytes` and then assign a span to the pointer *after* the call. However, the rewriter introduced the `base::span` *before* the call.