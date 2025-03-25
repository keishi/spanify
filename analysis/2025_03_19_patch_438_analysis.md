# Build Failure Analysis: 2025_03_19_patch_438

## First error

../../net/disk_cache/blockfile/entry_impl.cc:212:20: error: no viable conversion from 'IOBuffer' (aka 'net::IOBuffer') to 'base::span<char>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified the UserBuffer::Write function, but failed to spanify the call site. The IOBuffer is passed into a spanified function, but the IOBuffer is not implicitly convertible to base::span. The rewriter should recognize when the IOBuffer is being passed to a spanified function, and create a `.data()` call.

## Solution
The rewriter should recognize the IOBuffer case and insert `.data()` where necessary.

## Note
Additional errors:
* Rewriter needs to cast argument to base::span::subspan() to an unsigned value.