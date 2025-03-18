# Build Failure Analysis: 2025_03_14_patch_1226

## First error

../../media/midi/usb_midi_input_stream.cc:69:47: error: no viable conversion from 'const uint8_t *' (aka 'const unsigned char *') to 'base::span<const uint8_t>' (aka 'span<const unsigned char>')

## Category
Rewriter needs to generate code to construct a span from a raw pointer and a size.

## Reason
The rewriter is changing the function signature of `UsbMidiInputStream::ProcessOnePacket` to take a `base::span<const uint8_t>` instead of a `const uint8_t*`. However, the call site is passing a raw pointer `&data[current]`. The rewriter is missing the code to construct a `base::span` from this raw pointer and a size.

## Solution
The rewriter should generate code to construct a `base::span` at the call site using the data pointer and the known size.  In this case, `UsbMidiDevice::kPacketSize` is the size.  The solution is shown as follows:

```c++
    ProcessOnePacket(device, endpoint_number, 
                     base::span<const uint8_t>(&data[current], UsbMidiDevice::kPacketSize),
                     time);
```

## Note
It seems like `UsbMidiDevice::kPacketSize` might be too large for some cases. There may be a crash with this fix.