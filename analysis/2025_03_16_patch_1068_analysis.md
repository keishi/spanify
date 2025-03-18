# Build Failure Analysis: 2025_03_16_patch_1068

## First error

../../cc/metrics/shared_metrics_buffer.h:39:5: error: no matching function for call to 'AtomicWriterMemcpy'
   39 |     device::OneWriterSeqLock::AtomicWriterMemcpy(&data, &in, sizeof(T));
      |     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate correct code for `AtomicWriterMemcpy` with `base::span` argument.

## Reason
The spanified `AtomicWriterMemcpy` function is being called with a raw pointer (`&in`), but the function now expects a `base::span<const T>`. The compiler is unable to find a matching overload because the raw pointer cannot be implicitly converted to a span.

## Solution
The rewriter should recognize the pattern of a raw pointer being passed to a function that now expects a `base::span` and generate code to construct a span from the pointer and size. The code should look like this:

```c++
device::OneWriterSeqLock::AtomicWriterMemcpy(&data, base::span{&in, 1}, sizeof(T));
```

Alternatively if `size` is the actual length of the source and it is known at compile time (as hinted by the file name `AtomicWriterMemcpy` meaning that it is only used with atomic store) then the generated expression can become.
```c++
device::OneWriterSeqLock::AtomicWriterMemcpy(&data, base::span{&in, size / sizeof(T)}, size);
```

## Note
The fix will need to account for the case where the element count is different than one, generating the correct `base::span` constructor with the correct size argument.