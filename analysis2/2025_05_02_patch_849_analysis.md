# Build Failure Analysis: 2025_05_02_patch_849

## First error

../../media/parsers/vp9_uncompressed_header_parser.cc:783:11: error: use of undeclared identifier 'ref_frame_sign_bias'

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter has incorrectly introduced `ref_frame_sign_bias` in the `memset` call within the `SetupPastIndependence` function. The code attempts to use `ref_frame_sign_bias` as if it were a local variable, while the intention was to access the member of the `fhdr` parameter.

## Solution
The rewriter should not have added `.data()` to `ref_frame_sign_bias` because this member was converted to std::array.

The correct code should be:
```c++
memset(fhdr->ref_frame_sign_bias.data(), 0,
         (fhdr->ref_frame_sign_bias.size() *
          sizeof(decltype(fhdr->ref_frame_sign_bias)::value_type)));
```
or even better:
```c++
fhdr->ref_frame_sign_bias.fill(0);
```

## Note
The two other errors are related to this one. Specifically:

- The second error is caused by accessing `ref_frame_sign_bias` as a local variable.
- The third error is a `static_assert` that fails because `Vp9RefType::VP9_FRAME_LAST + kVp9NumRefsPerFrame` is 4, while `ref_frame_sign_bias` has a size of `Vp9RefType::VP9_FRAME_MAX` which is also 4.