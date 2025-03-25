# Build Failure Analysis: 2025_03_19_patch_1262

## First error

../../net/http/transport_security_state_unittest.cc:1598:44: error: no matching conversion for functional-style cast from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t, 1>' (aka 'span<unsigned char, 1>')
 1598 |   extras::PreloadDecoder::BitReader reader(base::span<uint8_t, 1>(&encoded), 8);
      |                                            ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter spanified the `BitReader` constructor but failed to account for the fact that the code is now taking the address of the `encoded` variable. The compiler error says there is no viable conversion from `uint8_t*` to `base::span<uint8_t, 1>`.

## Solution
The rewriter needs to create a temporary variable to pass to the function, and then use the temporary variable to create a new span.
The generated code should look like this:

```c++
uint8_t encoded = 0x02;
uint8_t* encoded_ptr = &encoded;
extras::PreloadDecoder::BitReader reader(base::span<uint8_t, 1>(encoded_ptr), 8);
```

## Note
There is another similar error further down in the file.
```
../../net/http/transport_security_state_unittest.cc:1598:44: error: no matching conversion for functional-style cast from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t, 1>' (aka 'span<unsigned char, 1>')
 1598 |   extras::PreloadDecoder::BitReader reader(base::span<uint8_t, 1>(&encoded), 8);
      |                                            ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~