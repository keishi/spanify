# Build Failure Analysis: 2025_03_15_patch_1079

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The `Channel::Message::mutable_payload()` function has a return type of void*. The rewriter is trying to create a `base::span<void>` but `base::span`'s reference cannot be of type void.

```c++
  946 |   using reference = element_type&;
```

In addition, gthe `BrokerMessageHeader` struct is used in `CreateBrokerMessage` and defined in `mojo/public/interfaces/bindings`. Thus, we shouldn't spanify functions that require rewriting excluded code.

## Solution
Add additional check in the rewriter to prevent function to be spanified
if function signature contains type from excluded code.

## Note
There were other errors:
```
../../mojo/core/broker_messages.h:64:7: error: cannot cast from type 'base::span<void>' to pointer type 'BrokerMessageHeader *'
   64 |       static_cast<BrokerMessageHeader*>(message->mutable_payload());
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../mojo/core/broker_messages.h:81:7: error: reinterpret_cast from 'base::span<void>' to 'BrokerMessageHeader *' is not allowed
   81 |       reinterpret_cast<BrokerMessageHeader*>(message->mutable_payload());
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~