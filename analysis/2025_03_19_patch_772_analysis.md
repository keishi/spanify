# Build Failure Analysis: 2025_03_19_patch_772

## First error

../../chrome/browser/devtools/device/usb/android_rsa.cc:87:24: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The rewriter converted the return type of `BnNew` from `uint32_t*` to `base::span<uint32_t>`. The code attempts to assign the result of `new uint32_t[kBigIntSize]` to the `base::span<uint32_t> result`. Since `new` returns a raw pointer, there is no implicit conversion to span. This pattern is not handled by the rewriter. This code should use a owned type like unique_ptr or a collection.

## Solution
The rewriter needs to recognize this pattern and generate a `base::make_span` call to construct the `base::span<uint32_t>`. Also the function return type must be wrapped in `base::ScopedAllowBaseCallee`.
Note that this is not the correct solution, but this is what the rewriter must do.
Also, the following pattern must be avoided, which means this pattern should be marked as WontFix.

## Note
The rewriter needs to be able to recognize this pattern in order to generate fixes. This may also be a feature request where the rewriter would automatically convert raw pointers allocated with `new` to smart pointers (e.g. `std::unique_ptr`).
Multiple similar errors are seen in this log.