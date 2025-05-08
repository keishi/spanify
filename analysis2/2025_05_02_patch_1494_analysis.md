# Build Failure Analysis: 2025_05_02_patch_1494

## First error

../../components/speech/audio_buffer.h:35:12: error: no viable conversion from returned value of type 'uint8_t *' (aka 'unsigned char *') to function return type 'base::span<uint8_t>' (aka 'span<unsigned char>')
   35 |     return reinterpret_cast<uint8_t*>(&data_string_[0]);
      |            ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter changed the return type of `AudioChunk::writable_data()` to `base::span<uint8_t>`. However, the function body simply returns the result of `reinterpret_cast<uint8_t*>(&data_string_[0])`, which is a `uint8_t*`. There is no implicit conversion from `uint8_t*` to `base::span<uint8_t>`.

## Solution
The rewriter should have added `.data()` to the return value to construct a `base::span` from the underlying pointer.

```c++
  // Original:
  uint8_t* writable_data() {
    return reinterpret_cast<uint8_t*>(&data_string_[0]);
  }

  // Rewritten:
  base::span<uint8_t> writable_data() {
    return base::span(reinterpret_cast<uint8_t*>(&data_string_[0]), data_string_.length());
  }
```

Since `data_string_` is a `std::string`, we can use the `length()` method to provide the correct size when constructing the span.