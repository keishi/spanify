# Build Failure Analysis: 2025_03_19_patch_236

## First error

../../media/parsers/vp9_uncompressed_header_parser.cc:783:11: error: use of undeclared identifier 'ref_frame_sign_bias'
  783 |          (ref_frame_sign_bias.size() *
      |           ^

## Category
Rewriter needs to use the member name to access arrayified member.

## Reason
The rewriter converted `ref_frame_sign_bias` to a `std::array`, but didn't update the access to that member to use the member name `fhdr->ref_frame_sign_bias.data()`. The code should use the correct member name.

## Solution
The rewriter should generate the correct code.

```
- memset(fhdr->ref_frame_sign_bias, 0, sizeof(fhdr->ref_frame_sign_bias));
+ memset(fhdr->ref_frame_sign_bias.data(), 0,
+        (ref_frame_sign_bias.size() *
+         sizeof(decltype(ref_frame_sign_bias)::value_type)));
```

becomes

```
- memset(fhdr->ref_frame_sign_bias, 0, sizeof(fhdr->ref_frame_sign_bias));
+ memset(fhdr->ref_frame_sign_bias.data(), 0,
+         (fhdr->ref_frame_sign_bias.size() *
+          sizeof(decltype(fhdr->ref_frame_sign_bias)::value_type)));
```

## Note
The other errors are follow-up errors.