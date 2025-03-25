# Build Failure Analysis: 2025_03_19_patch_88

## First error

../../sandbox/linux/syscall_broker/broker_simple_message.h:126:43: error: no viable conversion from 'std::array<uint8_t, kMaxMessageLength>' (aka 'array<unsigned char, kMaxMessageLength>') to 'uint8_t *' (aka 'unsigned char *')

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter converted `message_` to `std::array<uint8_t, kMaxMessageLength>`. But `read_next_` and `write_next_` members are still defined as `uint8_t*`. Since `std::array` is not implicitly convertible to a pointer, the rewriter needs to rewrite these variables as well to be compatible with `std::array`.

## Solution
Convert `read_next_` and `write_next_` to `uint8_t*` which points to data() from the `message_` array. It seems like spanifying it is unnecessary.

```c++
  RAW_PTR_EXCLUSION uint8_t* read_next_ = message_.data();
  RAW_PTR_EXCLUSION uint8_t* write_next_ = message_.data();
```

## Note
There are several errors in this log:
1. The first error occurs because the `read_next_` member is trying to be initialized with a `std::array` object instead of a pointer.
2. The second error occurs because the `write_next_` member is trying to be initialized with a `std::array` object instead of a pointer.
3. The third error occurs because the code is trying to use `reinterpret_cast` to convert `message_` to `const void*`, but `message_` is now a `std::array` instead of a pointer, so this conversion is invalid. To get the address of the underlying array, use `.data()`.
4. The fourth error occurs for similar reasons.