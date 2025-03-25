# Build Failure Analysis: 2025_03_19_patch_1396

## First error

../../media/gpu/vaapi/test/h264_decoder.cc:935:21: error: member reference type 'base::span<const H264ModificationOfPicNum>' is not a pointer; did you mean to use '.'?

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The code attempts to use `->` to access members of `list_mod`, but `list_mod` is now a `base::span`, not a pointer. The rewriter failed to replace the `->` with `.` to access the member of the underlying object.

## Solution
The rewriter needs to replace `->` with `.` when accessing members of a spanified variable.

## Note
Several other errors in the log have the same root cause. The last error shows that `++list_mod` is also invalid since list_mod is now a span and not a pointer.