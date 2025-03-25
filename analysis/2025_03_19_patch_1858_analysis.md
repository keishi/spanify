# Build Failure Analysis: 2025_03_19_patch_1858

## First error
../../mojo/core/ipcz_driver/invitation.cc:432:70: error: no viable conversion from 'std::array<IpczHandle, kMaxAttachments + 1>' (aka 'array<unsigned long, kMaxAttachments + 1>') to 'IpczHandle *' (aka 'unsigned long *')
  432 |       GetIpczNode(), transport, kMaxAttachments + 1, flags, nullptr, portals);
      |                                                                      ^~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The code is calling a function that expects a `IpczHandle*` but is now receiving a `std::array<IpczHandle, kMaxAttachments + 1>`.
```
   IpczDriverHandle transport = CreateTransportForMojoEndpoint(
        {.source = is_isolated ? Transport::kBroker : Transport::kNonBroker,
         .destination = Transport::kBroker},
```
The `CreateTransportForMojoEndpoint` function is the problem, because it takes `portals` as argument.

The `Portals` argument is third party code:
```
../../third_party/ipcz/include/ipcz/driver_declarations.h:247: IpczResult IpczDriverCreateMojoEndpoint(
```

Thus we shouldn't be modifying functions that require us to rewrite third party code.

## Solution
The rewriter shouldn't spanify `Invitation::Accept` because it calls `IpczDriverCreateMojoEndpoint` which takes a raw pointer that we cannot rewrite.

```
  IpczDriverHandle transport = CreateTransportForMojoEndpoint(
```

## Note
This is a good example of the rewriter attempting to rewrite public code, and then failing to spanify a callsite due to it requiring third party code.

```
diff --git a/mojo/core/ipcz_driver/invitation.cc b/mojo/core/ipcz_driver/invitation.cc
index 4b3f717dab641..19a30133ae61f 100644
--- a/mojo/core/ipcz_driver/invitation.cc
+++ b/mojo/core/ipcz_driver/invitation.cc
@@ -2,6 +8,8 @@
```

The line above shows that the rewriter correctly removed `#include <array>`, which suggests the only change that the rewriter made was on `portals`.