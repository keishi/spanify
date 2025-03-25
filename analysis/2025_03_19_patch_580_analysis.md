# Build Failure Analysis: 2025_03_19_patch_580

## First error
../../services/tracing/perfetto/producer_host.h:82:29: error: non-virtual member function marked 'override' hides virtual member function
   82 |       perfetto::FlushFlags) override;
      |                             ^
../../third_party/perfetto/include/perfetto/ext/tracing/core/producer.h:109:16: note: hidden overloaded virtual function 'perfetto::Producer::Flush' declared here: type mismatch at 2nd parameter ('const DataSourceInstanceID *' (aka 'const unsigned long *') vs 'base::span<const perfetto::DataSourceInstanceID>' (aka 'span<const unsigned long>'))
  109 |   virtual void Flush(FlushRequestID,
      |                ^

## Category
Pointer passed into spanified function parameter.

## Reason
The `Flush` function in `ProducerHost` overrides the `Flush` function in `perfetto::Producer`. However, the signature of the overridden function has changed from `const perfetto::DataSourceInstanceID*` to `base::span<const perfetto::DataSourceInstanceID>`. The compiler is reporting that the `override` keyword is hiding the virtual function because the function signatures do not match, which means the function is actually being overloaded instead of overriden.

## Solution
The argument to `ProducerHost::Flush` should be `const perfetto::DataSourceInstanceID*`. This makes the override correct. It is likely that a call site was not spanified.
To fix this bug, undo the change on `services/tracing/perfetto/producer_host.h` and `services/tracing/perfetto/producer_host.cc`. Then find the call site and change the parameter type there.

## Note
The error message clearly indicates a type mismatch between the function signature in the derived class (`ProducerHost`) and the base class (`perfetto::Producer`).