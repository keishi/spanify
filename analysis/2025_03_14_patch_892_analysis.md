# Build Failure Analysis: 2025_03_14_patch_892

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/base/atomicops.cc at offset 1865, length 4294967295: "=dst_byte_ptr.subspan()" and offset 2099, length 1: " "

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter is attempting to replace `uint8_t* dst_byte_ptr = dst.data();` with `base::span<uint8_t>dst_byte_ptr = dst;` But it is also attempting to remove the space on the next line ` std::atomic_ref<uint8_t>(*dst_byte_ptr)` resulting in overlapping replacements.

## Solution
The rewriter should not attempt to rewrite the variable to `base::span<uint8_t>` it is then immediately dereferenced and the type is not preserved at the call sites. This is not what the rewriter is intended to do.

## Note
The rewriter should only rewrite cases where the type is preserved at the call sites as well.