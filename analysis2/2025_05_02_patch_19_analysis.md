# Build Failure Analysis: 2025_05_02_patch_19

## First error
../../media/formats/mp4/avc.cc:100:37: error: no member named 'subspan' in 'std::array<unsigned char, 4>'

## Category
Rewriter failed to apply subspan rewrite to a spanified variable.

## Reason
The variable `kAnnexBStartCode` was converted to `std::array`, and the rewriter tried to call `.subspan()` on it, but `std::array` does not have a `subspan` method. The `.subspan()` method should have been called on a `base::span` object. This happened in `buffer->insert(buffer->end(), kAnnexBStartCode.data(), kAnnexBStartCode.subspan(kAnnexBStartCodeSize).data());`. It appears that since `kAnnexBStartCode` is a `std::array` now, the rewriter should have wrapped the usage of `kAnnexBStartCode` with `base::span`.

## Solution
When calling `.subspan()` on an arrayified variable, the rewriter should wrap the variable in `base::span<>`. The corrected code should be `buffer->insert(buffer->end(), kAnnexBStartCode.data(), base::span(kAnnexBStartCode).subspan(kAnnexBStartCodeSize).data());`.

## Note
The error occurred on multiple lines.