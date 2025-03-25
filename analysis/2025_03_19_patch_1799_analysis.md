# Build Failure Analysis: 2025_03_19_patch_1799

## First error

../../services/device/hid/hid_connection_linux.cc:141:12: error: cannot increment value of type 'base::span<uint8_t>' (aka 'span<unsigned char>')
  141 |       (data++)[0] = 0;
      |        ~~~~^

## Category
Rewriter needs to avoid using postfix increment operator on span.

## Reason
The rewriter spanified `data` into `base::span<uint8_t> data = buffer->as_vector();`. Now the `data` variable is a span instead of a pointer, the postfix increment `data++` is no longer valid.  The correct code should increment the value at the data location `data[0] = 0; data = data.subspan(1);`.

## Solution
The rewriter should avoid using postfix increment operator on span. Specifically, the code `(data++)[0] = 0;` is rewritten incorrectly. Since `data` is now a span and not a pointer, the code should be rewritten to `data[0] = 0; data = data.subspan(1);`. This also has to apply if `data` is a raw_ptr<T>.

## Note
The original code was 
```c++
*data++ = 0;
length--;
```
which is equivalent to
```c++
(data++)[0] = 0;
length--;