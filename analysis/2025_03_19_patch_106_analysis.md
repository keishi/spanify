# Build Failure Analysis: 2025_03_19_patch_106

## First error

../../base/containers/span.h:946:33: error: cannot form a reference to 'void'
  946 |   using reference = element_type&;
      |                                 ^
../../mojo/core/broker_messages.h:64:50: note: in instantiation of template class 'base::span<void>' requested here
   64 |       static_cast<BrokerMessageHeader*>(message->mutable_payload());
      |                                                  ^

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter attempts to create a `base::span<void>` which is invalid because `void` cannot be a reference type. `Channel::Message::mutable_payload()` returns a `void*` and spanifying this function causes a `base::span<void>`. The `mutable_payload` function should not be spanified.

## Solution
The rewriter should not spanify functions that would result in using a span with an incomplete type like void. Add a check to avoid spanifying such functions.

## Note
The other errors are all related to the invalid `base::span<void>`.