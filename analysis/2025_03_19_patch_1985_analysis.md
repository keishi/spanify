# Build Failure Analysis: 2025_03_19_patch_1985

## First error

Overlapping replacements: ./components/media_router/common/providers/cast/certificate/cast_crl.cc at offset 17486, length 84: ").subspan( sizeof kCastFallbackCRLs /
                                                 sizeof)" and offset 17488, length 24: "(kCastFallbackCRLs.size() * sizeof(decltype(kCastFallbackCRLs)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof kCastFallbackCRLs / sizeof kCastFallbackCRLs[0]` into `kCastFallbackCRLs.size() * sizeof(decltype(kCastFallbackCRLs)::value_type))`. At the same time, it also attempts to add `.data()` to `kCastFallbackCRLs` which is being converted to `std::array`. This leads to overlapping replacements.

## Solution
The rewriter needs to avoid generating overlapping replacements. This can be solved by properly ordering the replacements and properly calculating the offsets for the replacements to avoid overlapping.

## Note
The build log indicates the same kind of error.