```
# Build Failure Analysis: 2025_03_19_patch_850

## First error

```
../../gpu/command_buffer/tests/gl_map_buffer_range_unittest.cc:549:29: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')
  549 |   base::span<const uint8_t> map_ptr = static_cast<uint8_t*>(
      |                             ^         ~~~~~~~~~~~~~~~~~~~~~~

```

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter failed to add `.data()` when assigning the raw pointer returned from `static_cast<uint8_t*>(glMapBufferRange(...))` to a `base::span<const uint8_t>`. The right-hand side of the assignment should have been `static_cast<uint8_t*>(glMapBufferRange(...)).data()`.

## Solution
Modify the rewriter to add `.data()` when assigning the raw pointer returned from `glMapBufferRange` to a span.

## Note
The other errors are likely consequences of this first error. After fixing the first issue, a new build might reveal different errors.