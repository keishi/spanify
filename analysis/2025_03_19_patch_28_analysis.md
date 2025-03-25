# Build Failure Analysis: 2025_03_19_patch_28

## First error

../../device/fido/enclave/attestation.cc:356:29: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  356 |   base::span<const uint8_t> data = OBJ_get0_data(obj.get());

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter is directly assigning the return value of `OBJ_get0_data` to a span.  However, `OBJ_get0_data` returns a raw pointer (`const uint8_t*`), and the compiler cannot implicitly convert a raw pointer to a `base::span` without size information. The rewriter needs to wrap the raw pointer in a `base::span` constructor call to create a valid `span` object, using the length returned by OBJ_length.

## Solution
The rewriter should generate code to explicitly construct a `base::span` from the pointer and size, instead of assigning the raw pointer directly.

```c++
base::span<const uint8_t> data(OBJ_get0_data(obj.get()), OBJ_length(obj.get()));
```

## Note
The second error in the log shows that the rewriter also needs to update the call to `assign()` to use `.data()` when assigning to `der_oid_out`. This could be solved with another rewrite to add the `.data()`, or just using the `std::copy` from before the patch.