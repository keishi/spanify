# Build Failure Analysis: 2025_03_14_patch_1033

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is attempting to spanify `Channel::Message::mutable_payload` which returns a `void*`. However the `span` class does not allow void as a template argument. This is because void does not have a size or an ability to form a reference.
In this specific instance, the issue arises because code under `mojo/core/` is not expected to be rewritten. This means the functions receiving the `void*` value are not expected to be rewritten as well.

## Solution
The rewriter should avoid spanifying `Channel::Message::mutable_payload` since it returns a `void*`. It should use a more specific type like `char*` or `uint8_t*` and should confirm that the corresponding functions receiving the `void*` will also be rewritten. Alternatively the rewriter could blacklist this function from being rewritten.

## Note
The build failure has 14 errors all related to the improper usage of span with void and incompatible casts and member accesses.