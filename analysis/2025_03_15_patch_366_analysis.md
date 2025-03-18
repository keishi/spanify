# Build Failure Analysis: 2025_03_15_patch_366

## First error

../../chrome/updater/certificate_tag.cc:473:8: error: no matching function for call to 'CBB_finish'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `CBB_finish` is expecting a `uint8_t **` as its second argument, but it's receiving a `base::span<uint8_t> *`. The rewriter failed to recognize this discrepancy and adjust the call site accordingly.

## Solution
The rewriter needs to correctly handle cases where a function expecting a `uint8_t **` is called with a `base::span<uint8_t> *`. It needs to dereference the span and get a pointer to the underlying data.

For example, change this code:

```c++
  CBB_finish(cbb.get(), &cbb_data, &cbb_len)
```

to:

```c++
  CBB_finish(cbb.get(), &cbb_data.data(), &cbb_len)
```

## Note
There are additional errors in the log related to the span usage in the ret.insert call. These errors will likely be fixed by addressing the primary error. It also looks like the openssl free was also not spanified correctly. The fix will likely involve adding .data() to the span variable.

```
../../chrome/updater/certificate_tag.cc:482:68: error: invalid operands to binary expression ('base::span<uint8_t>' (aka 'span<unsigned char>') and 'size_t' (aka 'unsigned long'))
  482 |   UNSAFE_BUFFERS(ret.insert(ret.begin(), cbb_data.data(), cbb_data + cbb_len));
      |                                                           ~~~~~~~~ ^ ~~~~~~~
../../chrome/updater/certificate_tag.cc:483:21: error: member reference base to non-class type 'base::span<uint8_t>' (aka 'span<unsigned char>')
  483 |   OPENSSL_free(cbb_data.data());
      |