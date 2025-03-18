# Build Failure Analysis: 2025_03_14_patch_1534

## First error

../../mojo/core/ipcz_driver/invitation.cc:432:70: error: no viable conversion from 'std::array<IpczHandle, kMaxAttachments + 1>' (aka 'array<unsigned long, kMaxAttachments + 1>') to 'IpczHandle *' (aka 'unsigned long *')

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code was rewritten to use `std::array` instead of `IpczHandle portals[kMaxAttachments + 1];`. The `Accept` function is third party code and its signature is.

```c++
IpczResult IpczAPI::IpczCreateBroker(IpczHandle node,
                                     IpczDriverHandle transport,
                                     size_t max_portals,
                                     IpczBrokerFlags flags,
                                     const void* options,
                                     IpczHandle* portals)
```

Thus we can't rewrite it, so we need to pass `portals.data()` instead of just `portals`.

## Solution
The rewriter should add `.data()` when a variable that was converted from a C-style array to std::array is passed to a third_party function call.

## Note
There are no additional errors.