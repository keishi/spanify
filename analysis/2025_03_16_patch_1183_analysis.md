# Build Failure Analysis: 2025_03_16_patch_1183

## First error

../../sandbox/linux/syscall_broker/broker_simple_message.h:126:43: error: no viable conversion from 'std::array<uint8_t, kMaxMessageLength>' (aka 'array<unsigned char, kMaxMessageLength>') to 'uint8_t *' (aka 'unsigned char *')
  126 |   RAW_PTR_EXCLUSION uint8_t* read_next_ = message_;
      |                                           ^~~~~~~~

## Category
Rewriter needs to handle address of an arrayified variable passed into a function.

## Reason
The rewriter changed `uint8_t message_[kMaxMessageLength];` to `std::array<uint8_t, kMaxMessageLength> message_;`. Then it tried to initialize `uint8_t* read_next_ = message_;`. But `message_` is now an `std::array` and not a `uint8_t*`. So the initialization is invalid. It needs to use the `.data()` method to get a pointer to the underlying data.

## Solution
The rewriter needs to add `.data()` to the initialization of the `read_next_` and `write_next_` pointers.

## Note
The other error is similar:
```
../../sandbox/linux/syscall_broker/broker_simple_message.h:127:44: error: no viable conversion from 'std::array<uint8_t, kMaxMessageLength>' (aka 'array<unsigned char, kMaxMessageLength>') to 'uint8_t *' (aka 'unsigned char *')
  127 |   RAW_PTR_EXCLUSION uint8_t* write_next_ = message_;
      |                                            ^~~~~~~~