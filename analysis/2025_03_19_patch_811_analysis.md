# Build Failure Analysis: 2025_03_19_patch_811

## First error

../../components/webrtc_logging/common/partial_circular_buffer.cc:26:26: error: invalid operands to binary expression ('std::array<uint8_t, 1>' (aka 'array<unsigned char, 1>') and 'uint8_t *' (aka 'unsigned char *'))
  26 |       buffer_data_->data - reinterpret_cast<uint8_t*>(buffer_data_.get());
      |       ~~~~~~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to account for `std::array` when calculating offsets.

## Reason
The rewriter is incorrectly calculating offsets by subtracting a raw pointer from a `std::array`. When spanifying the code, the rewriter also converted the `uint8_t data[1]` to `std::array<uint8_t, 1> data`. The problem is, `buffer_data_->data` is now a `std::array`, and you cannot subtract a raw pointer from a `std::array`.

## Solution
The rewriter needs to use pointer arithmetic relative to the `.data()` member to calculate the offset instead. For example, use `(buffer_data_->data.data() -  reinterpret_cast<uint8_t*>(buffer_data_.get()))`

## Note
There were a lot of other errors too:

1. The rewriter is also failing to recognize that `subspan` requires `.data()` on `std::array`.
2. Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.
```
../../components/webrtc_logging/common/partial_circular_buffer.cc:77:18: error: no member named 'span' in namespace 'base'
   77 |            base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |            ~~~~~~^
../../components/webrtc_logging/common/partial_circular_buffer.cc:77:23: error: unexpected type name 'uint8_t': expected expression
   77 |            base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                       ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:77:52: error: no member named 'subspan' in 'std::array<unsigned char, 1>'
   77 |            base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                               ~~~~~~~~~~~~~~~~~~~~ ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:108:18: error: no member named 'span' in namespace 'base'
  108 |            base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |            ~~~~~~^
../../components/webrtc_logging/common/partial_circular_buffer.cc:108:23: error: unexpected type name 'uint8_t': expected expression
  108 |            base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                       ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:108:52: error: no member named 'subspan' in 'std::array<unsigned char, 1>'
  108 |            base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                               ~~~~~~~~~~~~~~~~~~~~ ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:135:16: error: no member named 'span' in namespace 'base'
  135 |          base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |          ~~~~~~^
../../components/webrtc_logging/common/partial_circular_buffer.cc:135:21: error: unexpected type name 'uint8_t': expected expression
  135 |          base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                     ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:135:50: error: no member named 'subspan' in 'std::array<unsigned char, 1>'
  135 |          base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                             ~~~~~~~~~~~~~~~~~~~~ ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:181:18: error: no member named 'span' in namespace 'base'
  181 |     memcpy(base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |            ~~~~~~^
../../components/webrtc_logging/common/partial_circular_buffer.cc:181:23: error: unexpected type name 'uint8_t': expected expression
  181 |     memcpy(base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                       ^
../../components/webrtc_logging/common/partial_circular_buffer.cc:181:52: error: no member named 'subspan' in 'std::array<unsigned char, 1>'
  181 |     memcpy(base::span<uint8_t>(buffer_data_->data).subspan(position_).data(),
      |                               ~~~~~~~~~~~~~~~~~~~~ ^