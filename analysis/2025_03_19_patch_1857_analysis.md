# Build Failure Analysis: 2025_03_19_patch_1857

## First error

../../mojo/core/ipcz_driver/invitation.cc:315:71: error: no viable conversion from 'std::array<IpczHandle, kMaxAttachments + 1>' (aka 'array<unsigned long, kMaxAttachments + 1>') to 'IpczHandle *' (aka 'unsigned long *')

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `IpczHandle portals[kMaxAttachments + 1]` to `std::array<IpczHandle, kMaxAttachments + 1> portals`. The `ConnectNode` function expects a C-style array (i.e., a pointer) as its last argument, but the rewriter did not add `.data()` to convert the `std::array` to a pointer.

## Solution
The rewriter should add `.data()` when converting a C-style array to `std::array` when that variable is passed to a function that requires a pointer.

## Note
kMaxAttachments is a macro defined as 63.