# Build Failure Analysis: 2025_03_19_patch_157

## First error

../../dbus/property.cc:630:40: error: cannot initialize a parameter of type 'const uint8_t **' (aka 'const unsigned char **') with an rvalue of type 'base::span<const uint8_t> *' (aka 'span<const unsigned char> *')
  630 |     if (!struct_reader.PopArrayOfBytes(&bytes, &length))
      |                                        ^~~~~~
../../dbus/message.h:443:40: note: passing argument to parameter 'bytes' here
  443 |   bool PopArrayOfBytes(const uint8_t** bytes, size_t* length);
      |                                        ^

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `struct_reader.PopArrayOfBytes` expects a raw pointer (`const uint8_t**`), but the variable `bytes` has been spanified (`base::span<const uint8_t>`). The rewriter did not recognize that the function parameter was spanified and thus did not provide code to convert it to a raw pointer.

## Solution
The rewriter needs to be able to recognize the case where a raw pointer parameter of a function is assigned the value of a spanified variable. In this case, the rewriter should call `.data()` on the spanified variable before passing it to the function. The call to `.subspan()` is not necessary.

```c++
-   if (!struct_reader.PopArrayOfBytes(&bytes, &length))
+   if (!struct_reader.PopArrayOfBytes(&bytes.data(), &length))
```

## Note
The other line that has been changed is not the cause of the build failure. `entry.first.assign(bytes, bytes + length);` has been converted to `entry.first.assign(bytes.data(), bytes.subspan(length).data());`. The former was using pointer arithmetic, so this change was likely a good thing.