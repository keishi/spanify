# Build Failure Analysis: 15

## First error

../../media/base/decoder_buffer.h:176:14: error: no viable conversion from returned value of type 'const base::span<const uint8_t>' to function return type 'const base::span<uint8_t>'

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified the `data()` function to return a `base::span<uint8_t>`, but it failed to update the return type of `data()` which is specified by this line:

```c++
const base::span<uint8_t> data() const {
```

The return value of type `external_memory_->Span()` which is `const base::span<const uint8_t>` cannot be implicitly converted to `const base::span<uint8_t>`.

## Solution
The rewriter should also update the return type to `const base::span<const uint8_t>` when the span is const.

```c++
 const base::span<const uint8_t> data() const {
```

## Note
The `EXPECT_FALSE(buffer->data())` was changed to `EXPECT_FALSE(buffer->data().empty())`. This is correct.
The rewriter also correctly updated the calls to `memcpy` to use `.data()` on the `span` variables.