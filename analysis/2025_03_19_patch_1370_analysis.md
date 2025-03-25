```
# Build Failure Analysis: 2025_03_19_patch_1370

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^
../../media/gpu/vaapi/test/fake_libva_driver/fake_buffer.cc:66:30: note: in instantiation of template class 'base::span<void>' requested here
   66 | base::span<void> FakeBuffer::GetData() const {
      |                              ^

## Category
Rewriter needs to avoid creating span of void.

## Reason
The rewriter incorrectly modified the return type of `FakeBuffer::GetData` to `base::span<void>`. `base::span<void>` is not a valid type because spans must contain elements of a known type.

## Solution
The rewriter should not attempt to rewrite the return type to span if the original return type is void. The rewriter should detect the return type being `void*`, and correctly rewrite the return type in `.h` file.