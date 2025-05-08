# Build Failure Analysis: 2025_05_02_patch_1122

## First error

../../sandbox/linux/syscall_broker/broker_simple_message.h:126:43: error: no viable conversion from 'std::array<uint8_t, kMaxMessageLength>' (aka 'array<unsigned char, kMaxMessageLength>') to 'uint8_t *' (aka 'unsigned char *')

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The error occurs because the rewriter converted the `message_` member from a C-style array `uint8_t message_[kMaxMessageLength]` to an `std::array<uint8_t, kMaxMessageLength> message_`.  The `read_next_` and `write_next_` members are `uint8_t*` pointers that were initialized with `message_`. After the change, the compiler cannot implicitly convert from `std::array` to `uint8_t*`.  The rewriter should have updated the initialization of `read_next_` and `write_next_` to use `message_.data()`. The error message indicates that the `std::array` cannot be converted to `uint8_t*`.

## Solution
The rewriter needs to update the initialization of the pointer members `read_next_` and `write_next_` to use `message_.data()` to get a pointer to the underlying data in the `std::array`.

The lines:
```c++
RAW_PTR_EXCLUSION uint8_t* read_next_ = message_;
RAW_PTR_EXCLUSION uint8_t* write_next_ = message_;
```

should be rewritten to:
```c++
RAW_PTR_EXCLUSION uint8_t* read_next_ = message_.data();
RAW_PTR_EXCLUSION uint8_t* write_next_ = message_.data();
```

## Note
The other errors are follow-up errors caused by the first error. They occur because the code now uses `std::array` instead of `uint8_t[]`.
```
../../sandbox/linux/syscall_broker/broker_simple_message.cc:105:21: error: reinterpret_cast from 'std::array<uint8_t, kMaxMessageLength>' (aka 'array<unsigned char, kMaxMessageLength>') to 'const void *' is not allowed
../../sandbox/linux/syscall_broker/broker_simple_message.cc:161:23: error: no viable conversion from 'std::array<uint8_t, kMaxMessageLength>' (aka 'array<unsigned char, kMaxMessageLength>') to 'void *'