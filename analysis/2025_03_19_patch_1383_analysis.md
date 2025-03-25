# Build Failure Analysis: 2025_03_19_patch_1383

## First error

../../chrome/updater/certificate_tag.cc:473:8: error: no matching function for call to 'CBB_finish'
  473 |       !CBB_finish(cbb.get(), &cbb_data, &cbb_len)) {
      |        ^~~~~~~~~~
../../third_party/boringssl/src/include/openssl/bytestring.h:500:20: note: candidate function not viable: no known conversion from 'base::span<uint8_t> *' (aka 'span<unsigned char> *') to 'uint8_t **' (aka 'unsigned char **') for 2nd argument
  500 | OPENSSL_EXPORT int CBB_finish(CBB *cbb, uint8_t **out_data, size_t *out_len);
      |                    ^                    ~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to be aware of the expected types when dealing with arguments of third_party functions after spanification.

## Reason
The `CBB_finish` function expects a `uint8_t **` as its second argument, but the rewriter is passing a `base::span<uint8_t> *`. This is because the rewriter replaced `uint8_t* cbb_data` with `base::span<uint8_t> cbb_data`, but didn't update the call to `CBB_finish` to account for this change. The original code was passing the address of a pointer, whereas the modified code is passing the address of a span.

## Solution
The rewriter needs to dereference the span and get the raw pointer before passing it to the `CBB_finish` function. This can be done by using the `.data()` method on the span.

The correct code would be:
```c++
!CBB_finish(cbb.get(), reinterpret_cast<uint8_t**>(&cbb_data.data()), &cbb_len))
```
However `cbb_data.data()` returns a `uint8_t*`, and we need a `uint8_t**`, so a cast is needed.

## Note

The second error is that the insert function is being called with a span rather than a raw pointer and offset.
```c++
ret.insert(ret.begin(), cbb_data.data(), cbb_data + cbb_len));
```
needs to be changed to 
```c++
ret.insert(ret.begin(), cbb_data.data(), cbb_data.data() + cbb_len));
```

The third error is that OPENSSL_free is being called with a span rather than a raw pointer:

```c++
OPENSSL_free(cbb_data.data());
```
is the correct usage.